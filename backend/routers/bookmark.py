# backend/routers/bookmark.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/bookmarks",
    tags=["Bookmark"]
)

@router.post("/", response_model=schemas.BookmarkOut)
def create_bookmark(
    bookmark: schemas.BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_bookmark = db.query(models.Bookmark).filter_by(
        user_id=current_user.id,
        recipe_id=bookmark.recipe_id
    ).first()

    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Already bookmarked this recipe.")

    db_bookmark = models.Bookmark(user_id=current_user.id, recipe_id=bookmark.recipe_id)
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

@router.get("/me", response_model=list[schemas.BookmarkOut])
def get_my_bookmarks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).all()

@router.delete("/{bookmark_id}", status_code=204)
def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.id == bookmark_id,
        models.Bookmark.user_id == current_user.id
    ).first()
    if not db_bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(db_bookmark)
    db.commit()
    return
