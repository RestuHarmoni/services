const menuToggle = document.querySelector('.rh-menu-toggle');
const navMenu = document.querySelector('.rh-nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });
}

const revealItems = document.querySelectorAll('section, article');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('rh-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealItems.forEach((item) => observer.observe(item));
