// 
document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('.container');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  });

  elements.forEach(element => {
    observer.observe(element);
  });
});

// menu mobill
const menu = document.getElementById("menu");
        const action = document.getElementById("action");

        menu.addEventListener("click", () => {
            handle();
        });

        function handle() {
            menu.classList.toggle("is-active");
            action.classList.toggle("is-active");

            if (action.classList.contains("is-active")) {
                menu.classList.remove("fa-bars");
                menu.classList.add("fa-times");
            } else {
                menu.classList.remove("fa-times");
                menu.classList.add("fa-bars");
            }
        }

// mousemove 


        document.addEventListener('mousemove', function(e) {
          if (!window.matchMedia("(max-width: 768px)").matches) { 
              const follower = document.querySelector('.fire-follower');
              const mouseX = e.clientX;
              const mouseY = e.clientY;
      
              follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
          }
      });
      
      
// DOMContentLoaded 
        document.addEventListener('DOMContentLoaded', function () {
        const menuIcon = document.getElementById('menu');
        const navMenu = document.getElementById('action');
        const navItems = document.querySelectorAll('.nav-item');
    
        menuIcon.addEventListener('click', function () {
            navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
        });
    
        navItems.forEach(item => {
            item.addEventListener('click', function () {
              if (window.innerWidth < 768) { 
                navMenu.style.display = 'none';
                menu.classList.remove("fa-times");
                menu.classList.add("fa-bars");
              }
            });
        });
    });
    


    // pagination

    let projectsPerPage = 4; 
    let currentPage = 1;
    
    const projects = document.querySelectorAll('.project-item');
    
    function updateProjectsPerPage() {
      if (window.innerWidth <= 768) {
        projectsPerPage = 1; 
      } else {
        projectsPerPage = 4; 
      }
    }
    
    const totalPages = () => Math.ceil(projects.length / projectsPerPage);
    
    function showPage(page) {
      updateProjectsPerPage(); 
    
      if (page < 1) page = 1;
      if (page > totalPages()) page = totalPages();
    
      currentPage = page;
    
      projects.forEach((project, index) => {
        project.style.display = (index >= (currentPage - 1) * projectsPerPage && index < currentPage * projectsPerPage) ? 'block' : 'none';
      });
    
      document.querySelectorAll('.pagination .page_item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentPage) {
          item.classList.add('active');
        }
      });
    
      document.querySelector('.prevous_page').classList.toggle('disabled', currentPage === 1);
      document.querySelector('.next_page').classList.toggle('disabled', currentPage === totalPages());
    }
    
    function changePage(step) {
      showPage(currentPage + step);
    }
    
    function goToPage(page) {
      showPage(page);
    }
    
    window.addEventListener('resize', showPage.bind(null, currentPage)); 
    showPage(currentPage);
    



 