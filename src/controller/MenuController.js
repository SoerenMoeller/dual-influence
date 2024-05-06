/**
 * Initializes the menu and all the ways to open and close it.
 */
function init() {
    const menuContainer = document.getElementById("menu-overlay");
    const menu = menuContainer.childNodes[1];
    menuContainer.style.display = "none";

    const menuButton = document.getElementById("menu-button");
    menuButton.addEventListener("click", (evt) => toggleMenu());
    document.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape" || evt.key === "Esc") {
            toggleMenu();
        } 
    });

    const exitButton = document.getElementById("exit-button");
    exitButton.addEventListener("click", (evt) => toggleMenu());

    document.addEventListener("click", (evt) => { 
        if (menuContainer.contains(evt.target) && !menu.contains(evt.target)){
            toggleMenu();
        }
    });
}


/**
 * Toggles the visibility of the menu container.
 */
function toggleMenu() {
    const menuContainer = document.getElementById("menu-overlay");
    if (menuContainer.style.display == "none") {
        menuContainer.style.display = "flex";
        return;
    }

    menuContainer.style.display = "none";
}


function closeMenu() {
    const menuContainer = document.getElementById("menu-overlay");
    menuContainer.style.display = "none";
}


export { init, closeMenu };
