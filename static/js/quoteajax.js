document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements

    const productTypeTom = new TomSelect('#productType', {
        create: false,
        searchField: 'text',
        placeholder: '-- Select Product Type --',
        onInitialize: function() {
            this.setTextboxValue('');
        }
    });

    const makeTom = new TomSelect('#make', {
        create: false,
        searchField: 'text',
        placeholder: '-- Select Make --',
        onInitialize: function() {
            this.setTextboxValue('');
        }
    });

    const modelTom = new TomSelect('#model', {
        create: false,
        searchField: 'text',
        placeholder: '-- Select Model --',
        onInitialize: function() {
            this.setTextboxValue('');
        }
    });
    // const productTypeSelect = document.getElementById("productType");
    // const makeSelect = document.getElementById("make");
    // const modelSelect = document.getElementById("model");
    const conditionSelect = document.getElementById("condition");
    const dexteritySelect = document.getElementById("dexterity");
    const shaftSelect = document.getElementById("shaft");
    const makeupSelect = document.getElementById("makeup");
    const priceDisplay = document.getElementById("priceValue");
    const priceContainer = document.getElementById("priceContainer");

    // Container elements
    const makeContainer = document.getElementById("makeContainer");
    const modelContainer = document.getElementById("modelContainer");
    const conditionContainer = document.getElementById("conditionContainer");
    const dexterityContainer = document.getElementById("dexterityContainer");
    const shaftContainer = document.getElementById("shaftContainer");
    const makeupContainer = document.getElementById('makeupContainer');
    var isShaftsForModel = false;
    var isMakeupsForModel = false;
    // Last 4 dropdowns that should reset to value="0"
    const lastFourDropDowns = [conditionSelect, dexteritySelect, makeupSelect, shaftSelect];

    // Reset a dropdown (with different behavior for top vs bottom groups)
    function resetDropdown(selectElement, container, shouldResetValues, placeholder = "") {
        const tomInstance = getTomInstance(selectElement.id);
        if (tomInstance) {
            tomInstance.clear();
            if (shouldResetValues) {
                tomInstance.clearOptions();
                tomInstance.addOption({value: "", text: placeholder});
            }
        } else {
            if (shouldResetValues) {
                selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            }
        }
        container.classList.add("d-none");
    }
    
    // Helper function to get Tom Select instance
    function getTomInstance(id) {
        switch(id) {
            case 'productType': return productTypeTom;
            case 'make': return makeTom;
            case 'model': return modelTom;
            default: return null;
        }
    }
    

    // Reset last 4 dropdowns to their default (value="0") options
    function resetLastFourDropdowns() {
        lastFourDropDowns.forEach(select => {
            if (select.querySelector('option[value="0"]')) {
                select.value = "0";

            }
            const container = select.closest('.form-section');
            if (container) {
                container.classList.add('d-none');
            }
        });
    }

    // Fetch options for a dropdown via AJAX
    function fetchOptions(url, selectElement, container, placeholder) {
        const tomInstance = getTomInstance(selectElement.id);
         
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                resetDropdown(selectElement, container, placeholder);
                
                if (tomInstance) {
                    tomInstance.addOptions(data.map(item => ({
                        value: item.id,
                        text: item.name
                    })));
                } else {
                    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
                    data.forEach(item => {
                        const option = document.createElement("option");
                        option.value = item.id;
                        option.textContent = item.name;
                        selectElement.appendChild(option);
                    });
                }
                
                container.classList.remove("d-none");
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resetDropdown(selectElement, container, placeholder);
            });
    }

    function checkShaftAvailability(modelId) {
        // First fetch shaft availability
        fetch(`/get-shafts/?model=${modelId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(hasShafts => {
                
                // Handle shaft container
                if (shaftContainer) {
                    if (hasShafts) {
                        shaftContainer.classList.remove("d-none");
                        isShaftsForModel = true;
                    } else {
                        shaftContainer.classList.add("d-none");
                        if (shaftSelect) shaftSelect.value = "0";
                        isShaftsForModel = false;
                    }
                }
    
                // Always show condition container
                if (conditionContainer) {
                    conditionContainer.classList.remove("d-none");
                }
    
                // Now fetch makeup availability
                return fetch(`/get-makeups/?model=${modelId}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(hasMakeups => {

                
                // Handle makeup container
                if (makeupContainer) {
                    if (hasMakeups) {
                        makeupContainer.classList.remove("d-none"); 
                        isMakeupsForModel = true;
                    } else {
                        makeupContainer.classList.add("d-none");
                        if (makeupSelect) makeupSelect.value = "0";
                    }
                }
            })
            .catch(error => {
                console.error("Error in checkShaftAvailability:", error);
                
                // Safely handle DOM operations for both sections
                try {
                    if (shaftContainer) shaftContainer.classList.add("d-none");
                    if (conditionContainer) conditionContainer.classList.remove("d-none");
                    if (shaftSelect) shaftSelect.value = "0";
                    if (makeupContainer) makeupContainer.classList.add("d-none");
                    if (makeupSelect) makeupSelect.value = "0";
                    
                    isShaftsForModel = false;
                } catch (domError) {
                    console.error("DOM manipulation error:", domError);
                }
            });
    }
    // Fetch price based on all selected options
    function fetchPrice() {
    // Get values from Tom Select instances
        const productType = productTypeTom.getValue();
        const make = makeTom.getValue();
        const model = modelTom.getValue();
        const condition = conditionSelect.value;
        const dexterity = dexteritySelect.value; 
        const shaft = shaftSelect.value;
        const makeup = makeupSelect.value;

        // If Shafts Exist for this Model.
        if (isShaftsForModel){
            if (isMakeupsForModel)  {
                if (condition === "0" || dexterity === "0" || shaft === "0" || makeup === "0") {
                    priceContainer.classList.add("d-none");
                    return;
                }
            }
            else if(condition === "0" || dexterity === "0" || shaft === "0"){
                priceContainer.classList.add("d-none");
                return;
            }
        }
        else{
            if (condition === "0" || dexterity === "0") {
                priceContainer.classList.add("d-none");
                return;
            }
        }
        // Don't fetch price if any dropdown is in default state (value="0")

        if (productType && make && model && condition && dexterity) {
            const url = `/get-price/?product_type=${productType}&make=${make}&model=${model}&condition=${condition}&dexterity=${dexterity}&shaft=${shaft}&makeup=${makeup}`;
            
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
            { 
                select: productTypeTom, 
                selectElement: document.getElementById('productType'),
                container: makeContainer, 
                resetValues: true 
            },
            { 
                select: makeTom, 
                selectElement: document.getElementById('make'),
                container: modelContainer, 
                resetValues: true 
            },
            { 
                select: modelTom, 
                selectElement: document.getElementById('model'),
                container: conditionContainer, 
                resetValues: false 
            },
            { 
                select: conditionSelect, 
                selectElement: conditionSelect,
                container: dexterityContainer, 
                resetValues: false 
            },
            { 
                select: dexteritySelect, 
                selectElement: dexteritySelect,
                container: shaftContainer, 
                resetValues: false 
            }
        ];
    
        const changedIndex = dropdownHierarchy.findIndex(item => 
            item.select === changedSelect || item.selectElement === changedSelect
        );
        
        // Reset all subsequent dropdowns
        for (let i = changedIndex + 1; i < dropdownHierarchy.length; i++) {
            const { select, selectElement, container, resetValues } = dropdownHierarchy[i];
            const dropdownName = selectElement.id.replace('Select', '').replace(/([A-Z])/g, ' $1').trim();
            resetDropdown(selectElement, container, resetValues, `-- Select ${dropdownName} --`);
        }
        
        // If any of the top dropdowns change (ProductType, Make, or Model), reset last 4 dropdowns to value="0"
        if (changedIndex < 3) { // 0=ProductType, 1=Make, 2=Model
            resetLastFourDropdowns();
        }
        
        // Always hide price container when any dropdown changes
        priceContainer.classList.add("d-none");
    }

    // Event Listeners
    productTypeTom.on('change', function(value) {
        handleDropdownChange(this); // Pass the Tom Select instance
        if (value) {
            fetchOptions(
                `/get-makes/?product_type=${value}`,
                document.getElementById('make'),
                makeContainer,
                "-- Select Make --"
            );
        }
    });
    
    // Make change
    makeTom.on('change', function(value) {
        handleDropdownChange(this); // Pass the Tom Select instance
        if (value) {
            fetchOptions(
                `/get-models/?make=${value}`,
                document.getElementById('model'),
                modelContainer,
                "-- Select Model --"
            );
        }
    });
    
    // Model change
    modelTom.on('change', function(value) {
        handleDropdownChange(this); // Pass the Tom Select instance
        if (value) {
            checkShaftAvailability(value);
        }
    });


    // productTypeSelect.addEventListener("change", function() {
    //     handleDropdownChange(this);
    //     if (this.value) {
    //         fetchOptions(
    //             `/get-makes/?product_type=${this.value}`,
    //             makeSelect,
    //             makeContainer,
    //             "-- Select Make --"
    //         );
    //     }
    // });

    // makeSelect.addEventListener("change", function() {
    //     handleDropdownChange(this);
    //     if (this.value) {
    //         fetchOptions(
    //             `/get-models/?make=${this.value}`,
    //             modelSelect,
    //             modelContainer,
    //             "-- Select Model --"
    //         );
    //     }
    // });

    // modelSelect.addEventListener("change", function() {
    //     handleDropdownChange(this);
    //     if (this.value) {
    //         checkShaftAvailability(this.value);
    //     }
    // });

    conditionSelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value && this.value !== "0") {
            dexterityContainer.classList.remove("d-none");
        }
    });

    dexteritySelect.addEventListener("change", function() {
        handleDropdownChange(this);
        if (this.value && this.value !== "0") {
            if (isShaftsForModel){
                shaftContainer.classList.remove("d-none");
            }
        } 
    });

    // Price should be fetched when any of these change (but not when value="0")
    [conditionSelect, dexteritySelect, shaftSelect, makeupSelect].forEach(select => {
        select.addEventListener("change", function() {
            if (this.value !== "0") {
                fetchPrice();
            } else {
                priceContainer.classList.add("d-none");
            }
        });
    });
});