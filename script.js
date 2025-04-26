const { useState, useEffect } = React;


const DATABASE_URL = 'https://test-fc88c-default-rtdb.firebaseio.com/feedbacks.json';


function FeedbackForm({ onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !comment) {
      setMessage('Please fill all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setMessage('Invalid email format.');
      return;
    }

    const newFeedback = { name, email, comment, timestamp: new Date().toISOString() };

    const response = await fetch(DATABASE_URL, {
      method: 'POST',
      body: JSON.stringify(newFeedback),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      setName('');
      setEmail('');
      setComment('');
      setMessage('Feedback submitted successfully!');
      onAdd();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
      <button type="submit" className="sub">Submit Feedback</button>
      {message && <p>{message}</p>}
    </form>
  );
}


function FeedbackItem({ feedback, id, onDelete }) {
  return (
    <div className="feedback-item">
      <h3>{feedback.name}</h3>
      <p>{feedback.comment}</p>
      <small>{feedback.email}</small>
      <button className="delete-btn" onClick={() => onDelete(id)}>x</button>
    </div>
  );
}


function FeedbackList({ feedbacks, onDelete }) {
  return (
    <div className="feedback-list">
      {Object.keys(feedbacks).map(id => (
        <FeedbackItem key={id} id={id} feedback={feedbacks[id]} onDelete={onDelete} />
      ))}
    </div>
  );
}


function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    </button>
  );
}


function App() {
  const [feedbacks, setFeedbacks] = useState({});
  const [theme, setTheme] = useState('light');

  const fetchFeedbacks = async () => {
    const res = await fetch(DATABASE_URL);
    const data = await res.json();
    if (data) {
      setFeedbacks(data);
    } else {
      setFeedbacks({});
    }
  };

  const deleteFeedback = async (id) => {
    await fetch(`https://test-fc88c-default-rtdb.firebaseio.com/feedbacks/${id}.json`, {
      method: 'DELETE',
    });
    fetchFeedbacks();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    fetchFeedbacks();
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <>
      <header>
        <h1>Feedback Board</h1>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      <FeedbackForm onAdd={fetchFeedbacks} />
      <FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
2