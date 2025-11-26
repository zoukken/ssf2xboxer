// Dynamically set the <base> URL depending on where the site is running.
document.addEventListener("DOMContentLoaded", () => {
  const base = document.createElement("base");
  if (location.hostname === "zoukken.github.io") {
    base.href = "/ssf2xboxer/"; // Online - GitHub Pages
  } else {
    base.href = "/"; // Local environment
  }
  document.head.prepend(base);
});

// VIDEO.JS INITIALIZER
function initVideos(scope = document) {
  scope.querySelectorAll("video").forEach(v => {
    if (!v.classList.contains("video-js")) {
      v.classList.add("video-js");
      videojs(v, { fluid: true });
    }
  });
}

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

      // Initialize videos INSIDE the loaded content
      initVideos(contentContainer);

      // Extra logic: if matchups page, auto-select Ryu
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

// Default load & active button behavior
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nav-button");
  document.getElementById('button1')?.classList.add('active');

  // Load the default page
  showContent('guide');

  // Activate buttons
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".nav-button.active")?.classList.remove("active");
      button.classList.add("active");
    });
  });
});

// Matchup - Toggle character content
function toggleContent(contentId, clickedLink) {
  // Hide all sections
  document.querySelectorAll("#ryu, #honda, #blanka, #guile, #thawk, #feilong, #boxer, #sagat, #ken, #chunli, #zangief, #dhalsim, #cammy, #deejay, #vega, #mbison")
    .forEach(el => el.style.display = "none");

  // Show selected section
  const contentElement = document.getElementById(contentId);
  if (contentElement) contentElement.style.display = "block";

  // Update link state
  document.querySelectorAll('#charselect a')
    .forEach(link => link.classList.remove('clicked'));

  if (clickedLink) clickedLink.classList.add('clicked');
}
