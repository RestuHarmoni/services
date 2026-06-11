const toggle=document.querySelector('.nav-toggle');const menu=document.querySelector('.nav-menu');toggle?.addEventListener('click',()=>menu.classList.toggle('open'));
const reveal=()=>document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight-80)el.classList.add('show')});addEventListener('scroll',reveal);reveal();
