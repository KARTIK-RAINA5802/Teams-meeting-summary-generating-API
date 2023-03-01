import './App.css';


function App() {
  function run() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    fetch("http://localhost:5000/api/register", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
  }
  async function run2() {
    var email = document.getElementById("email2").value;
    var password = document.getElementById("password2").value;

    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    const data = await response.json()
    if (data.user) {
      alert('login successful')
    }
  }

  return (
    <div className="App">
      <div>
        <input type="text" name="name" id="name" placeholder="name"></input>
        <input type="text" name="email" id="email" placeholder="email"></input>
        <input type="text" name="password" id="password" placeholder="password"></input>
        <button onClick={run}>click here</button>
      </div>
      <br />
      <div>
        <input type="text" id="email2" placeholder="email"></input>
        <input type="text" id="password2" placeholder="password"></input>
        <button onClick={run2}>click here</button>
      </div>
    </div>
  );
}

export default App;
