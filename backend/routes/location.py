from fastapi import APIRouter, HTTPException, Depends
from backend.security import get_current_user, get_current_admin, require_role
import requests

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


@router.get("/regions")
def get_regions(user: dict = Depends(get_current_user)):

    response = requests.get(
        "https://psgc.cloud/api/v2/regions"
    )

    return response.json()


@router.get("/regions/{region_code}/provinces")
def get_provinces(region_code: str, user: dict = Depends(get_current_user)):

    # NCR special case
    if region_code == "1300000000":
        return [
            {
                "code": "1300000000",
                "name": "Metro Manila"
            }
        ]

    response = requests.get(
        f"https://psgc.cloud/api/v2/regions/{region_code}/provinces"
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch provinces"
        )

    return response.json()


@router.get("/regions/{region_code}/cities-municipalities")
def get_ncr_cities(region_code: str, user: dict = Depends(get_current_user)):

    response = requests.get(
        f"https://psgc.cloud/api/v2/regions/{region_code}/cities-municipalities"
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch NCR cities"
        )

    return response.json()


@router.get("/provinces/{province_code}/cities")
def get_cities(province_code: str, user: dict = Depends(get_current_user)):

    # NCR special case
    if province_code == "1300000000":

        response = requests.get(
            "https://psgc.cloud/api/v2/regions/1300000000/cities-municipalities"
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch NCR cities"
            )

        return response.json()

    response = requests.get(
        f"https://psgc.cloud/api/v2/provinces/{province_code}/cities-municipalities"
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch cities"
        )

    return response.json()


@router.get("/cities/{city_code}/barangays")
def get_barangays(city_code: str, user: dict = Depends(get_current_user)):

    response = requests.get(
        f"https://psgc.cloud/api/v2/cities-municipalities/{city_code}/barangays"
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch barangays"
        )

    return response.json()