import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import BooksPage from './BooksPage';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // 检查当前登录状态
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    // 监听登录状态变化
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.unsubscribe();
  }, []);

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('注册成功！请查看邮箱确认（如果开启了邮箱验证）');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div>
        <p>你好，{user.email} <button onClick={handleLogout}>退出</button></p>
        <hr />
        <BooksPage />
      </div>
    );
  }

  return (
    <div>
      <h1>开源书籍推荐</h1>
      <input placeholder="邮箱" onChange={e => setEmail(e.target.value)} />
      <input placeholder="密码" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>注册</button>
      <button onClick={handleLogin}>登录</button>
    </div>
  );
}
export default App;