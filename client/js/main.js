const menuIcon = document.getElementById("menu-icon");
const navbarMenu = document.getElementById("navbar-menu");

menuIcon.addEventListener("click", () => {
  navbarMenu.classList.toggle("show");
});

// Disable right-click
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", function (e) {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

// Example: Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
let currentSlide = 0;

async function loadSlides() {
  const res = await fetch("/api/get-sliders");
  const slides = await res.json();

  const container = document.getElementById("slider-container");
  container.innerHTML = "";

  slides.forEach((slide, index) => {
    const div = document.createElement("div");
    div.classList.add("slide");
    if (index !== 0) div.style.display = "none";

    div.style.backgroundImage = `url('${slide.imageUrl}')`;
    div.innerHTML = `
      <h2>${slide.title}</h2>
      <p>${slide.description}</p>
    `;
    container.appendChild(div);
  });

  // Slider change every 5s
  setInterval(() => {
    const slides = document.querySelectorAll(".slide");
    slides[currentSlide].style.display = "none";
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].style.display = "flex";
  }, 5000);
}

loadSlides();

const questions = document.querySelectorAll(".faq-question");

questions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    item.classList.toggle("active");

    // Close others
    questions.forEach((otherBtn) => {
      if (otherBtn !== btn) {
        otherBtn.parentElement.classList.remove("active");
      }
    });
  });
});

//

window.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("prevReview");
  const nextBtn = document.getElementById("nextReview");

  let currentIndex = 0;
  let reviewElements = [];

  async function loadApprovedReviews() {
    try {
      const res = await fetch("/api/approved-reviews");
      const reviews = await res.json();

      const container = document.getElementById("reviewSlider");
      container.innerHTML = "";

      reviews.forEach((review, index) => {
        const div = document.createElement("div");
        div.classList.add("review-card");
        if (index === 0) div.classList.add("active");

        div.innerHTML = `
          <h3>${review.name}</h3>
          <div class="rating">${"★".repeat(review.rating)}${"☆".repeat(
          5 - review.rating
        )}</div>
          <p>${review.message}</p>
        `;
        container.appendChild(div);
      });

      reviewElements = document.querySelectorAll(".review-card");
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }

  function showReview(index) {
    reviewElements.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
  }

  prevBtn.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + reviewElements.length) % reviewElements.length;
    showReview(currentIndex);
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % reviewElements.length;
    showReview(currentIndex);
  });

  loadApprovedReviews();
});
