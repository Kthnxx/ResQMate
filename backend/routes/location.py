from fastapi import APIRouter
import requests

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


@router.get("/regions")
def get_regions():

    response = requests.get(
        "https://psgc.cloud/api/v2/regions"
    )

    return response.json()


@router.get("/regions/{region_code}/provinces")
def get_provinces(region_code: str):

    # NCR special case
    if region_code == "130000000":
        return [
            {
                "code": "130000000",
                "name": "Metro Manila"
            }
        ]

    response = requests.get(
        f"https://psgc.cloud/api/v2/regions/{region_code}/provinces"
    )

    return response.json()


@router.get("/provinces/{province_code}/cities")
def get_cities(province_code: str):

    # NCR special case
    if province_code == "130000000":

        response = requests.get(
            "https://psgc.cloud/api/v2/regions/130000000/cities-municipalities"
        )

        return response.json()

    response = requests.get(
        f"https://psgc.cloud/api/v2/provinces/{province_code}/cities-municipalities"
    )

    return response.json()


@router.get("/cities/{city_code}/barangays")
def get_barangays(city_code: str):

    response = requests.get(
        f"https://psgc.cloud/api/v2/cities-municipalities/{city_code}/barangays"
    )

    return response.json()