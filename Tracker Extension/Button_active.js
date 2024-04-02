//Declare active buttons 
const buttons = document.querySelectorAll(".toggle-btn");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
});

