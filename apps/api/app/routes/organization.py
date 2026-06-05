from fastapi import APIRouter

from app.core.supabase import supabase

router = APIRouter()


@router.get("/organization")
def get_organization():

    response = (
        supabase
        .table("organizations")
        .select("*")
        .eq("slug", "buildherai-labs")
        .single()
        .execute()
    )

    return response.data