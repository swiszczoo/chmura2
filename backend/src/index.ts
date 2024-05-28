import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { myDataSource } from './data-source';

import { File } from './entity/file.entity';

dotenv.config();

import nanoid from 'nanoid';
import s3 from './aws';
import multer from 'multer';
import multerS3 from 'multer-s3';

import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

myDataSource
  .initialize()
  .then(() => console.log('Data source initialized!'))
  .catch((err) => console.error("Error during Data Source initialization:", err));

const FileRepository = myDataSource.getRepository(File);

const app: Application = express();
const port = process.env.PORT || 3000;
const bucketName = process.env.S3_BUCKET_NAME || '';

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      const key = nanoid.nanoid(96);
      (req as {key: string}).key = key;
      callback(null, key);
    },
  })
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/files', async (req: Request, res: Response) => {
  res.json(await FileRepository.find());
});

app.get('/api/files/:id', async (req: Request, res: Response) => {
  const file = await FileRepository.findOneBy({ id: parseInt(req.params.id) });
  if (file) {
    res.json(file);
  } else {
    res.status(404).send('');
  }
});

app.get('/api/files/:id/download', async (req: Request, res: Response) => {
  const file = await FileRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!file) {
    res.status(404).send('');
    return;
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: file.s3key,
    ResponseContentDisposition: `attachment; filename=${file.filename}`
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  res.redirect(302, url);
});

app.patch('/api/files/:id', async (req: Request, res: Response) => {
  const result = await FileRepository.update({ id: parseInt(req.params.id) }, {
    filename: req.body.filename
  });

  if (result.affected) {
    res.json({ status: 'ok' });
  } else {
    res.status(404).send('');
  }
});

app.delete('/api/files/:id', async (req: Request, res: Response) => {
  const item = await FileRepository.findOneBy({ id: parseInt(req.params.id) });
    if (item) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: item.s3key,
    });

    await s3.send(command);
  }

  const result = await FileRepository.delete({ id: parseInt(req.params.id) });
  if (result.affected) {
    res.status(204).send('');
  } else {
    res.status(404).send('');
  }
});

app.post('/api/files', upload.single('file'), async (req: Request, res: Response) => {
  const filename: string = req.body.filename;
  const key = (req as unknown as Record<string, string>).key;
  await FileRepository.insert({
    filename: filename,
    s3link: `https://s3.us-east-1.amazonaws.com/chmura2/${key}`,
    s3key: key,
  });
  res.json({status: 'ok'});
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
