// Array of JSON file paths
const jsonFiles = [
    'bottomunderwear1.json', 'bottomunderwear2.json',
    'topunderwear1.json', 'topunderwear2.json',
    'boxers1.json', 'boxers2.json',
    'sweatshirt1.json', 'sweatshirt2.json',
    'shoes1.json', 'shoes2.json',
    'pants1.json', 'pants2.json',
    'skirt1.json', 'skirt2.json',
    'top1.json', 'top2.json',
    'outerpants2.json',
    'dress1.json', 'dress2.json',
    'jacket1.json', 'jacket2.json',
    'accessories1.json', 'accessories2.json',
    'hat1.json', 'hat2.json'
];

// Helper function to set z-index for categories
function getZIndex(categoryName) {
    const zIndexMap = {
        bottomunderwear: 2,
        topunderwear: 3,
        boxers: 4,
        sweatshirt: 5,
        shoes: 6,
        pants: 8,
        skirt: 9,
        top: 10,
        outerpants: 11,
        dress: 12,
        jacket: 13,
        accessories: 14,
        hat: 15,
    };
    return zIndexMap[categoryName] || 0;
}

// Load each JSON file
async function loadItemFile(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Error loading file: ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to load ${file}:`, error);
        return [];
    }
}

// Load items in batches
async function loadItemsInBatches(batchSize = 5) {
    const baseContainer = document.querySelector('.base-container');
    const controlsContainer = document.querySelector('.controls');

    for (let i = 0; i < jsonFiles.length; i += batchSize) {
        const batch = jsonFiles.slice(i, i + batchSize);

        await Promise.all(batch.map(async file => {
            const data = await loadItemFile(file);
            const categoryName = file.replace('.json', '');
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('category');

            const categoryHeading = document.createElement('h3');
            categoryHeading.textContent = categoryName;
            categoryContainer.appendChild(categoryHeading);

            data.forEach(item => {
                const itemId = item.id.endsWith('.png') ? item.id : `${item.id}.png`;

                const img = document.createElement('img');
                img.id = itemId;
                img.src = item.src;
                img.alt = item.alt;
                img.classList.add(categoryName);
                img.style.visibility = item.visibility === "visible" ? "visible" : "hidden";
                img.style.position = 'absolute';
                img.style.zIndex = getZIndex(categoryName);
                baseContainer.appendChild(img);

                const button = document.createElement('img');
                const buttonFile = item.src.replace('.png', 'b.png');
                button.src = buttonFile;
                button.alt = item.alt + ' Button';
                button.classList.add('item-button');
                button.onclick = () => toggleVisibility(itemId, categoryName);
                categoryContainer.appendChild(button);
            });

            controlsContainer.appendChild(categoryContainer);
        }));

        await new Promise(resolve => setTimeout(resolve, 50)); // Delay for responsiveness
    }
}

// Toggle visibility of item images and enforce mutual exclusivity
function toggleVisibility(itemId, categoryName) {
    const selectedItem = document.getElementById(itemId);
    const isVisible = selectedItem.style.visibility === 'visible';

    // Toggle visibility of the clicked item
    selectedItem.style.visibility = isVisible ? 'hidden' : 'visible';

    // If the item is becoming visible, hide conflicting categories
    if (!isVisible) {
        if (categoryName === 'dress1') {
            hideSpecificCategories(['top1', 'pants1', 'skirt1', 'sweatshirt1']);
        } else if (categoryName === 'dress2') {
            hideSpecificCategories(['top2', 'pants2', 'skirt2', 'sweatshirt2', 'outerpants2']);
        } else if (categoryName === 'outerpants2') {
            hideSpecificCategories(['pants1', 'pants2', 'skirt1', 'skirt2', 'dress1', 'dress2']);
        } else if (['pants1', 'pants2', 'skirt1', 'skirt2', 'dress1', 'dress2'].includes(categoryName)) {
            hideSpecificCategories(['outerpants2']);
        }
    }

    // Debug: Log the action
    console.log(`Toggled ${itemId} (${categoryName}) to ${selectedItem.style.visibility}`);
}

// Helper function to hide items for specific categories
function hideSpecificCategories(categories) {
    categories.forEach(category => {
        const items = document.querySelectorAll(`.${category}`);
        items.forEach(item => {
            item.style.visibility = 'hidden'; // Set visibility to hidden
        });
    });
}

// Adjust canvas layout dynamically
function adjustCanvasLayout() {
    const baseContainer = document.querySelector('.base-container');
    const controlsContainer = document.querySelector('.controls');

    const screenWidth = window.innerWidth;

    if (screenWidth <= 600) {
        baseContainer.style.display = 'flex';
        baseContainer.style.flexWrap = 'nowrap';
        baseContainer.style.justifyContent = 'space-between';
    } else {
        baseContainer.style.display = 'block';
        baseContainer.style.width = '500px';
        baseContainer.style.height = '400px';
        controlsContainer.style.marginTop = 'auto';
    }
}

// Apply layout adjustment on load and resize
window.onload = () => {
    loadItemsInBatches();
    adjustCanvasLayout();
};

window.addEventListener('resize', adjustCanvasLayout);

// Function to enter game mode
function enterGame() {
    document.querySelector('.main-menu').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
}