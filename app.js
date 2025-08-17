document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you for subscribing!');
});