import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001'); // Connect to the backend

const GRID_SIZE = 16;

function App() {
  const [grid, setGrid] = useState<string[][]>(Array(GRID_SIZE).fill(Array(GRID_SIZE).fill('green')));
  const [roomCode, setRoomCode] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [inRoom, setInRoom] = useState<boolean>(false);

  useEffect(() => {
    socket.on('grid_update', (updatedGrid: string[][]) => {
      setGrid(updatedGrid);
    });
  }, []);

  const handleJoinRoom = () => {
    if (roomCode) {
      socket.emit('join_room', roomCode);
      setInRoom(true);
      setId(socket.id)
    }
  };

  const handleBoxClick = (x: number, y: number) => {
    socket.emit('click_box', { roomCode, x, y });
  };

  return (
    <div className="App">
      {!inRoom ? (
        <div>
          <h1>Join a Room</h1>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <h1>Room: {roomCode}</h1>
          <h2>Your id: {id}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}>
            {grid.map((row, rowIndex) =>
              row.map((box, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleBoxClick(rowIndex, colIndex)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: box,
                    border: '1px solid black',
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
