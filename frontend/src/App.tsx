import { useMemo, useRef, useState } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  const [ lastUpdate, setLastUpdate ] = useState<number>(new Date().getTime());
  const [ data, setData ] = useState<{id:number; filename: string; s3link: string; s3key: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useMemo(async () => {
    setData((await axios.get('/api/files')).data);
  }, [lastUpdate]);

  const handleSendClick = () => {
    if (!inputRef.current?.files?.length) {
      alert('Nie wybrano pliku!');
      return;
    }

    const formData = new FormData();
    formData.append('file', inputRef.current.files[0]);
    formData.append('filename', inputRef.current.files[0].name);
    axios.post('/api/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(() => {
      setLastUpdate(new Date().getTime());
    }).catch((err) => alert('Wystąpił błąd przy wysyłaniu pliku: ' + err));
  };

  const handleDownloadClick = (index: number) => {
    const a = document.createElement('a');
    a.href = data[index].s3link;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRenameClick = (index: number) => {
    const newName = prompt('Podaj nową nazwę pliku:');
    if (newName) {
      axios.patch(`/api/files/${data[index].id}`, { filename: newName })
        .then(() => setLastUpdate(new Date().getTime()))
        .catch((err) => alert('Wystąpił błąd przy zmianie nazwy pliku: ' + err));
    }
  };

  const handleDeleteClick = (index: number) => {
    axios.delete(`/api/files/${data[index].id}`)
        .then(() => setLastUpdate(new Date().getTime()))
        .catch((err) => alert('Wystąpił błąd przy usuwaniu pliku: ' + err));
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Nazwa pliku</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((entry, index) => <tr>
              <td>{entry.id}</td>
              <td>{entry.filename}</td>
              <td>
                <button onClick={handleDownloadClick.bind(null, index)}>Pobierz</button>&nbsp;
                <button onClick={handleRenameClick.bind(null, index)}>Zmień nazwę</button>&nbsp;
                <button onClick={handleDeleteClick.bind(null, index)}>Usuń</button>
              </td>
            </tr>)
          }
        </tbody>
      </table>
      <h2>Upload pliku</h2>
      <input type='file' id='inputfile' ref={inputRef}/>
      <button onClick={handleSendClick}>Wyślij</button>
    </>
  )
}

export default App
