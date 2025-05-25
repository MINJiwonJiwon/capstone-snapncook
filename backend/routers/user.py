# routers/user.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.schemas import UserCreateWithPassword, UserOut
from backend import crud
from backend.db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreateWithPassword, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db, user)

@router.get("/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
