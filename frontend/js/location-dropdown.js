const LOCATION_API_URL = "http://127.0.0.1:8000";

const regionSelect = document.getElementById("region");
const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");
const barangaySelect = document.getElementById("barangay");

document.addEventListener("DOMContentLoaded", () => {
    loadRegions();
});

/* ==========================
   LOAD REGIONS
========================== */
async function loadRegions() {

    try {

        const response = await fetch(
            `${API_URL}/locations/regions`
        );

        const result = await response.json();

        const regions = result.data || result;

        regionSelect.innerHTML =
            '<option value="">Select Region</option>';

        regions.forEach(region => {

            regionSelect.innerHTML += `
                <option value="${region.code}">
                    ${region.name}
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
regionSelect.addEventListener(
    "change",
    async () => {

        const regionCode =
            regionSelect.value;

        provinceSelect.innerHTML =
            '<option value="">Select Province</option>';

        citySelect.innerHTML =
            '<option value="">Select City</option>';

        barangaySelect.innerHTML =
            '<option value="">Select Barangay</option>';

        // NCR special case
        if (regionCode === "130000000") {

            provinceSelect.innerHTML = `
                <option value="130000000">
                    Metro Manila
                </option>
            `;

            provinceSelect.disabled = true;

            loadCities("130000000");

            return;
        }

        provinceSelect.disabled = false;

        try {

            const response = await fetch(
                `${API_URL}/locations/regions/${regionCode}/provinces`
            );

            const result = await response.json();

            const provinces =
                result.data || result;

            provinces.forEach(province => {

                provinceSelect.innerHTML += `
                    <option value="${province.code}">
                        ${province.name}
                    </option>
                `;

            });

        } catch (error) {

            console.error(
                "Failed to load provinces",
                error
            );

        }

    }
);

/* ==========================
   PROVINCE CHANGE
========================== */
provinceSelect.addEventListener(
    "change",
    () => {

        loadCities(
            provinceSelect.value
        );

    }
);

/* ==========================
   LOAD CITIES
========================== */
async function loadCities(
    provinceCode
) {

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    barangaySelect.innerHTML =
        '<option value="">Select Barangay</option>';

    try {

        const response = await fetch(
            `${API_URL}/locations/provinces/${provinceCode}/cities`
        );

        const result = await response.json();

        const cities =
            result.data || result;

        cities.forEach(city => {

            citySelect.innerHTML += `
                <option value="${city.code}">
                    ${city.name}
                </option>
            `;

        });

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

        try {

            const response = await fetch(
                `${API_URL}/locations/cities/${cityCode}/barangays`
            );

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

        } catch (error) {

            console.error(
                "Failed to load barangays",
                error
            );

        }

    }
);