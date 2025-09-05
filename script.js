
// Load content dynamically based on menu clicks
function showContent(contentId) {
  const contentContainer = document.getElementById("content-container");
  contentContainer.innerHTML = '';

  const contentMap = {
    guide: 'guide.html',
    advanced: 'advanced.html',
    combos: 'combos.html',
    matchups: 'matchups.html'
  };

  const url = contentMap[contentId];
  if (!url) {
    console.warn('Unknown content ID:', contentId);
    return;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(html => {
      contentContainer.innerHTML = html;

      // Extra logic: if matchups, auto-select Ryu
      if (contentId === "matchups") {
        setTimeout(() => {
          const ryuLink = contentContainer.querySelector('#charselect a');
          if (ryuLink) {
            toggleContent("ryu", ryuLink);
          }
        }, 0);
      }
    })
    .catch(error => {
      console.error(`There was a problem fetching the ${contentId} content:`, error);
      contentContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
    });
}



// Display "Guide" by default and maintain active menu color when clicked away.
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".color-button");
  document.getElementById('button1')?.classList.add('active');
  showContent('guide');
  // Toggle active state on button click
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".color-button.active")?.classList.remove("active");
      button.classList.add("active");
    });
  });
});


// Toggle Content on matchup section
function toggleContent(contentId, clickedLink) {
  // Hide all content sections
  document.querySelectorAll("#ryu, #honda, #blanka, #guile, #thawk, #feilong, #boxer, #sagat, #ken, #chunli, #zangief, #dhalsim, #cammy, #deejay, #vega, #mbison")
    .forEach(el => el.style.display = "none");

  // Show selected content
  const contentElement = document.getElementById(contentId);
  if (contentElement) contentElement.style.display = "block";

  // Update link states
  document.querySelectorAll('#charselect a')
    .forEach(link => link.classList.remove('clicked'));
  if (clickedLink) clickedLink.classList.add('clicked');
}


// Lazy-loads <video> elements when they enter the viewport
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const src = target.dataset.src;
        if (src) {
          target.querySelector('source').src = src;
          target.load();
          obs.unobserve(target);
        }
      }
    });
  });

  document.querySelectorAll('video[data-src]').forEach(v => observer.observe(v));
});

// Lazy-loads <img> elements with the class "lazy-image" when they enter the viewport
document.addEventListener("DOMContentLoaded", () => {
  const lazyImages = document.querySelectorAll('img.lazy-image');
  const lazyVideos = document.querySelectorAll('video[data-poster]');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Handle <img>
      if (el.tagName === 'IMG' && el.dataset.src) {
        el.src = el.dataset.src;
        el.classList.remove('lazy-image');
      }

      // Handle <video>
      if (el.tagName === 'VIDEO' && el.dataset.poster) {
        el.poster = el.dataset.poster;
        el.removeAttribute('data-poster');
      }

      observer.unobserve(el);
    });
  }, {
    rootMargin: '0px 0px 200px 0px',
    threshold: 0.01
  });

  lazyImages.forEach(img => observer.observe(img));
  lazyVideos.forEach(video => observer.observe(video));
});