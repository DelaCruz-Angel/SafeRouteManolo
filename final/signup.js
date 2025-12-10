// Show / Hide Password
document.querySelectorAll('.toggle-password').forEach((eye) => {
  eye.addEventListener('click', () => {
    const pwdInput = eye.previousElementSibling;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
});

// User Class
class User {
  #firstName; #lastName; #mi; #email; #password;

  constructor(firstName, lastName, mi, email, password) {
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#mi = mi;
    this.#email = email;
    this.#password = password;
  }

  toJSON() {
    return {
      firstName: this.#firstName,
      lastName: this.#lastName,
      mi: this.#mi,
      email: this.#email,
      password: this.#password
    };
  }

  saveToStorage() {
    localStorage.setItem('user', JSON.stringify(this.toJSON()));
  }
}

const signupBtn = document.getElementById('signupBtn');
const signupMessage = document.getElementById('signupMessage');

// Restrict name fields to letters only
document.querySelectorAll('#firstName, #lastName, #mi').forEach((input) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^a-zA-Z]/g, '');
  });
});

// Signup Button Logic
signupBtn.addEventListener('click', () => {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const mi = document.getElementById('mi').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Validations
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    signupMessage.style.color = 'red';
    signupMessage.textContent = 'Please fill in all fields';
    return;
  }

  if (!email.endsWith('@gmail.com')) {
    signupMessage.style.color = 'red';
    signupMessage.textContent = 'Please use a valid Gmail account';
    return;
  }

  if (password !== confirmPassword) {
    signupMessage.style.color = 'red';
    signupMessage.textContent = 'Passwords do not match';
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    signupMessage.style.color = 'red';
    signupMessage.textContent =
      'Password must be 8+ chars long including uppercase, lowercase, number, and special character';
    return;
  }

  // Save User
  const newUser = new User(firstName, lastName, mi, email, password);
  newUser.saveToStorage();

  signupMessage.style.color = 'green';
  signupMessage.textContent = 'Sign up successful! Redirecting to login...';

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
});
