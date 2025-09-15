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
  const buttons = document.querySelectorAll(".nav-button");
  document.getElementById('button1')?.classList.add('active');
  showContent('guide');
  // Toggle active state on button click
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".nav-button.active")?.classList.remove("active");
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
