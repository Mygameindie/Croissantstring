

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

// Load a JSON file and return its data
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

// Toggle visibility of item images and enforce mutual exclusivity within the same category
function toggleVisibility(itemId, categoryName) {
    const selectedItem = document.getElementById(itemId);
    const isVisible = selectedItem.style.visibility === 'visible';

    // Hide all items in the same category
    const categoryItems = document.querySelectorAll(`.${categoryName}`);
    categoryItems.forEach(item => {
        item.style.visibility = 'hidden';
        item.style.zIndex = ''; // Reset z-index
    });

    // Toggle visibility of the clicked item
    selectedItem.style.visibility = isVisible ? 'hidden' : 'visible';

    // Ensure correct z-index for the selected item
    if (!isVisible) {
        selectedItem.style.zIndex = getZIndex(categoryName);

        // Handle conflicting categories
        if (['dress1', 'dress2'].includes(categoryName)) {
            hideSpecificCategories(['top', 'pants', 'skirt', 'sweatshirt', 'outerpants']);
        } else if (categoryName === 'outerpants') {
            hideSpecificCategories(['pants', 'skirt', 'dress']);
        } else if (['pants', 'skirt'].includes(categoryName)) {
            hideSpecificCategories(['outerpants', 'dress']);
        }
    }

    console.log(`Toggled ${itemId} (${categoryName}) to ${selectedItem.style.visibility}`);
}

// Helper function to hide items for specific categories
function hideSpecificCategories(categories) {
    categories.forEach(category => {
        const items = document.querySelectorAll(`.${category}`);
        items.forEach(item => {
            item.style.visibility = 'hidden';
        });
    });
}

// Load items in batches
async function loadItemsInBatches(batchSize = 5) {
    const baseContainer = document.querySelector('.base-container');
    const controlsContainer = document.querySelector('.controls');

    for (let i = 0; i < jsonFiles.length; i += batchSize) {
        const batch = jsonFiles.slice(i, i + batchSize);

        await Promise.all(batch.map(async file => {
            const data = await loadItemFile(file);
            const categoryName = file.replace('.json', '').toLowerCase();
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
                img.style.zIndex = getZIndex(categoryName); // Set z-index here
                baseContainer.appendChild(img);

                const button = document.createElement('img');
                button.src = item.src.replace('.png', 'b.png');
                button.alt = `${item.alt} Button`;
                button.classList.add('item-button');
                button.onclick = () => toggleVisibility(itemId, categoryName);
                categoryContainer.appendChild(button);
            });

            controlsContainer.appendChild(categoryContainer);
        }));

        await new Promise(resolve => setTimeout(resolve, 50)); // Delay for responsiveness
    }
}

// Adjust canvas layout dynamically
function adjustCanvasLayout() {
    const baseContainer = document.querySelector('.base-container');
    const controlsContainer = document.querySelector('.controls');

    const screenWidth = window.innerWidth;

    if (screenWidth <= 600) {
        baseContainer.style.display = 'flex';
        baseContainer.style.flexDirection = 'column';
        baseContainer.style.width = '90%';
        baseContainer.style.height = 'auto';
        controlsContainer.style.flexWrap = 'wrap';
    } else {
        baseContainer.style.display = 'block';
        baseContainer.style.width = '500px';
        baseContainer.style.height = '400px';
        controlsContainer.style.flexWrap = 'nowrap';
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
