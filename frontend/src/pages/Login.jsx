import React, 'useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// YENİ VE DOĞRU ADRES TANIMI
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, { // Değişti
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
      } else {
        toast.error(data.message);
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