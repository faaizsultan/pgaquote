document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const productTypeSelect = document.getElementById("productType");
    const makeSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const conditionSelect = document.getElementById("condition");
    const dexteritySelect = document.getElementById("dexterity");
    const shaftSelect = document.getElementById("shaft");
    const priceDisplay = document.getElementById("priceValue");
    const priceContainer = document.getElementById("priceContainer");

    // Container elements
    const makeContainer = document.getElementById("makeContainer");
    const modelContainer = document.getElementById("modelContainer");
    const conditionContainer = document.getElementById("conditionContainer");
    const dexterityContainer = document.getElementById("dexterityContainer");
    const shaftContainer = document.getElementById("shaftContainer");

    // Last 3 dropdowns that should reset to value="0"
    const lastThreeDropdowns = [conditionSelect, dexteritySelect, shaftSelect];

    // Reset a dropdown (with different behavior for top vs bottom groups)
    function resetDropdown(selectElement, container, shouldResetValues, placeholder = "") {
        if (shouldResetValues) {
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        }
        container.classList.add("d-none");
    }

    // Reset last 3 dropdowns to their default (value="0") options
    function resetLastThreeDropdowns() {
        lastThreeDropdowns.forEach(select => {
            if (select.querySelector('option[value="0"]')) {
                select.value = "0";
            }
        });
    }

    // Fetch options for a dropdown via AJAX
    function fetchOptions(url, selectElement, container, placeholder) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                selectElement.innerHTML = `<option value="">${placeholder}</option>`;
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
                container.classList.remove("d-none");
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                selectElement.innerHTML = `<option value="">${placeholder}</option>`;
                container.classList.add("d-none");
            });
    }

    // Check if model has shafts
    function checkShaftAvailability(modelId) {
        fetch(`/get-shafts/?model=${modelId}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(hasShafts => {
                if (hasShafts) {
                    shaftContainer.classList.remove("d-none");
                } else {
                    shaftContainer.classList.add("d-none");
                    shaftSelect.value = "0"; // Reset to default
                }
                // Show condition regardless of shaft availability
                conditionContainer.classList.remove("d-none");
            })
            .catch(error => {
                console.error("Error checking shaft availability:", error);
                shaftContainer.classList.add("d-none");
                conditionContainer.classList.remove("d-none");
            });
    }

    // Fetch price based on all selected options
    function fetchPrice() {
        const productType = productTypeSelect.value;
        const make = makeSelect.value;
        const model = modelSelect.value;
        const condition = conditionSelect.value;
        const dexterity = dexteritySelect.value;
        const shaft = shaftSelect.value;

        // Don't fetch price if any dropdown is in default state (value="0")
        if (condition === "0" || dexterity === "0" || shaft === "0") {
            priceContainer.classList.add("d-none");
            return;
        }

        if (productType && make && model && condition && dexterity) {
            const url = `/get-price/?product_type=${productType}&make=${make}&model=${model}&condition=${condition}&dexterity=${dexterity}&shaft=${shaft}`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error("Price not found");
                    return response.json();
                })
                .then(data => {
                    if (data.price !== null && data.price !== undefined) {
                        const priceNumber = parseFloat(data.price);
                        if (!isNaN(priceNumber)) { 
                            priceDisplay.innerHTML = `$${priceNumber.toFixed(2)}`;
                            priceContainer.classList.remove("d-none");
                        } else {
                            throw new Error("Invalid price format");
                        }
                    } 
                })
                .catch(error => {
                    console.error("Error fetching price:", error);
                    priceDisplay.textContent = "$0.00";
                    priceContainer.classList.add("d-none");
                });
        }
    }

    // Reset dropdowns based on changed dropdown
    function handleDropdownChange(changedSelect) {
        const dropdownHierarchy = [
            { select: productTypeSelect, container: makeContainer, resetValues: true },
            { select: makeSelect, container: modelContainer, resetValues: true },
            { select: modelSelect, container: conditionContainer, resetValues: false },
            { select: conditionSelect, container: dexterityContainer, resetValues: false },
            { select: dexteritySelect, container: shaftContainer, resetValues: false }
        ];

        const changedIndex = dropdownHierarchy.findIndex(item => item.select === changedSelect);
        
        // Reset all subsequent dropdowns
        for (let i = changedIndex + 1; i < dropdownHierarchy.length; i++) {
            const { select, container, resetValues } = dropdownHierarchy[i];
            resetDropdown(select, container, resetValues, `-- Select ${select.id.replace('Select', '')} --`);
        }
        
        // If any of the top dropdowns change (ProductType, Make, or Model), reset last 3 to value="0"
        if (changedIndex < 3) { // 0=ProductType, 1=Make, 2=Model
            resetLastThreeDropdowns();
        }
        
        // Always hide price container when any dropdown changes
        priceContainer.classList.add("d-none");
    }

    // Event Listeners
    productTypeSelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value) {
            fetchOptions(
                `/get-makes/?product_type=${this.value}`,
                makeSelect,
                makeContainer,
                "-- Select Make --"
            );
        }
    });

    makeSelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value) {
            fetchOptions(
                `/get-models/?make=${this.value}`,
                modelSelect,
                modelContainer,
                "-- Select Model --"
            );
        }
    });

    modelSelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value) {
            checkShaftAvailability(this.value);
        }
    });

    conditionSelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value && this.value !== "0") {
            dexterityContainer.classList.remove("d-none");
        }
    });

    dexteritySelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value && this.value !== "0") {
            shaftContainer.classList.remove("d-none");
        }
    });

    // Price should be fetched when any of these change (but not when value="0")
    [conditionSelect, dexteritySelect, shaftSelect].forEach(select => {
        select.addEventListener("change", function() {
            if (this.value !== "0") {
                fetchPrice();
            } else {
                priceContainer.classList.add("d-none");
            }
        });
    });
});