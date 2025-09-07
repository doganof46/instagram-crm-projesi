import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true'); // Giriş durumunu kaydet
        navigate('/dashboard'); // Panele yönlendir
      } else {
        toast.error(data.message); // Hata durumunda toast bildirimi göster
      }
    } catch (error) {
      toast.error("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Giriş Yap</h2>
        <input
          type="text"
          placeholder="Kullanıcı Adı (admin)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Parola (12345)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Giriş</button>
      </form>
    </div>
  );
}

export default Login;