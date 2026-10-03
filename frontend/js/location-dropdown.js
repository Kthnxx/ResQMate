const LOCATION_API_URL = "http://127.0.0.1:8000";

const regionSelect = document.getElementById("region");
const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");
const barangaySelect = document.getElementById("barangay");

document.addEventListener("DOMContentLoaded", () => {
    loadRegions();
});

function decodeText(text) {
    try {
        return decodeURIComponent(escape(text));
    } catch {
        return text;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}

/* ==========================
   LOAD REGIONS
========================== */
async function loadRegions() {

    try {

        const response = await fetch(
            `${LOCATION_API_URL}/locations/regions`
        , { headers: getAuthHeaders() });

        const result = await response.json();

        const regions = result.data || result;

        regionSelect.innerHTML =
            '<option value="">Select Region</option>';

        regions.forEach(region => {

            regionSelect.innerHTML += `
                <option value="${region.code}">
                    ${decodeText(region.name)}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "Failed to load regions",
            error
        );

    }

}

/* ==========================
   REGION CHANGE
========================== */
regionSelect.addEventListener("change", async () => {
    const regionCode = regionSelect.value;
    const selectedText = regionSelect.options[regionSelect.selectedIndex].text;

    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    // NCR special case
    if (regionCode === "1300000000" || selectedText.includes("NCR") || selectedText.includes("National Capital Region") || selectedText.includes("Metro Manila")) {
        provinceSelect.innerHTML = `
            <option value="1300000000" selected>
                Metro Manila
            </option>
        `;
        provinceSelect.disabled = false;
        loadCities("1300000000");
        return;
    }

    provinceSelect.disabled = false;

    try {
        const response = await fetch(`${LOCATION_API_URL}/locations/regions/${regionCode}/provinces`, { headers: getAuthHeaders() });
        const result = await response.json();
        const provinces = result.data || result;

        provinces.forEach(province => {
            provinceSelect.innerHTML += `
                <option value="${province.code}">
                    ${decodeText(province.name)}
                </option>
            `;
        });
    } catch (error) {
        console.error("Failed to load provinces", error);
    }
});

/* ==========================
   PROVINCE CHANGE
========================== */
provinceSelect.addEventListener(
    "change",
    () => {
        // If NCR is selected, don't re-trigger regular province code fetching
        if (regionSelect.value === "130000000") return;

        loadCities(
            provinceSelect.value
        );

    }
);

/* ==========================
   LOAD CITIES
========================== */
async function loadCities(
    codeToFetch
) {

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    barangaySelect.innerHTML =
        '<option value="">Select Barangay</option>';

    if (!codeToFetch) return;

    try {
        // If NCR, we fetch cities using the region code/province code endpoint depending on your backend
        // For NCR, if your API expects the region code or province code, adjust here:
        const endpoint = (codeToFetch === "1300000000" || regionSelect.value === "1300000000")
            ? `${LOCATION_API_URL}/locations/regions/1300000000/cities-municipalities`
            : `${LOCATION_API_URL}/locations/provinces/${codeToFetch}/cities`;

        const response = await fetch(endpoint, { headers: getAuthHeaders() });

        const result = await response.json();

        const cities =
            result.data || result;

        cities.forEach(city => {

            citySelect.innerHTML += `
                <option value="${city.code}">
                    ${decodeText(city.name)}
                </option>
            `;

        });

        // Ensure city dropdown is unlocked
        citySelect.disabled = false;

    } catch (error) {

        console.error(
            "Failed to load cities",
            error
        );

    }

}

/* ==========================
   CITY CHANGE
========================== */
citySelect.addEventListener(
    "change",
    async () => {

        const cityCode =
            citySelect.value;

        barangaySelect.innerHTML =
            '<option value="">Select Barangay</option>';

        if (!cityCode) return;

        try {

            const response = await fetch(
                `${LOCATION_API_URL}/locations/cities/${cityCode}/barangays`
            , { headers: getAuthHeaders() });

            const result = await response.json();

            const barangays =
                result.data || result;

            barangays.forEach(barangay => {

                barangaySelect.innerHTML += `
                    <option value="${barangay.code}">
                        ${barangay.name}
                    </option>
                `;

            });

            barangaySelect.disabled = false;

        } catch (error) {

            console.error(
                "Failed to load barangays",
                error
            );

        }

    }
);