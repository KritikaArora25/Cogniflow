const AuthForm = ({ isLogin, handleSubmit }) => {
  const [formData, setFormData] = React.useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }}>
        {!isLogin && <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />}
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
    </div>
  );
};

export default AuthForm;