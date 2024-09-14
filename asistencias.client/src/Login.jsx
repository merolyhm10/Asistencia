// Login.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/Login.css';
import logoArmada from './assets/logo-armada.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? '#333' : '#f0f0f0'; // Cambiar el color de fondo del body
    }, [darkMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        navigate('/home');
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div >

            <button onClick={toggleTheme} className="themeToggleButton">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <div className={`loginContainer ${darkMode ? 'dark' : 'light'}`}>
                <form onSubmit={handleSubmit}>

                    <div className='logoArmada'>
                        <img src={logoArmada} alt='Logo' />
                    </div>

                    <div className='inputField'>
                        <div className={`inputWrapper ${email ? 'focus' : ''}`}>
                            <label htmlFor='email' className='email'>E-mail</label>
                        </div>
                        <input
                            type='email'
                            id='email'
                            className='emailInput'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='inputField'>
                        <div className={`inputWrapper ${password ? 'focus' : ''}`}>
                            <label htmlFor='password' className='password'>Password</label>
                        </div>
                        <input
                            type='password'
                            id='password'
                            className='passwordInput'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type='submit'>Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
