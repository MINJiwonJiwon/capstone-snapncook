# backend/sample_seed.py
from db import SessionLocal
from backend import crud, schemas
from datetime import datetime
from random import randint, uniform, choice
from faker import Faker

fake = Faker("ko_KR")
db = SessionLocal()

NUM_USERS = 5
NUM_FOODS = 5
NUM_RECIPES_PER_FOOD = 2
NUM_REVIEW_PER_USER = 2
NUM_DETECTION_PER_USER = 2
NUM_INGREDIENT_INPUT_PER_USER = 2
NUM_LOGS_PER_USER = 3

user_objs = []
for _ in range(NUM_USERS):
    user = crud.create_user(db, schemas.UserCreate(
        email=fake.unique.email(),
        nickname=fake.name(),
        password_hash=fake.sha256()
    ))
    user_objs.append(user)

food_names = ["김치찌개", "된장찌개", "비빔밥", "불고기", "갈비탕"]
food_objs = []
for name in food_names:
    food = crud.create_food(db, schemas.FoodCreate(
        name=name,
        description=fake.sentence(),
        image_url=f"https://example.com/{name}.jpg"
    ))
    food_objs.append(food)

recipe_objs = []
for food in food_objs:
    for _ in range(NUM_RECIPES_PER_FOOD):
        recipe = crud.create_recipe(db, schemas.RecipeCreate(
            food_id=food.id,
            source_type="manual",
            title=f"{food.name} 만들기",
            ingredients=", ".join(fake.words(nb=5)),
            instructions=fake.paragraph(),
            source_detail="출처: 집밥 백선생"
        ))
        recipe_objs.append(recipe)
        for i in range(randint(2, 4)):
            crud.create_recipe_step(db, schemas.RecipeStepCreate(
                recipe_id=recipe.id,
                step_order=i + 1,
                description=f"Step {i + 1}: {fake.sentence()}",
                image_url=None
            ))

for user in user_objs:
    for _ in range(NUM_REVIEW_PER_USER):
        crud.create_review(db, schemas.ReviewCreate(
            user_id=user.id,
            food_id=choice(food_objs).id,
            content=fake.sentence(),
            rating=randint(3, 5)
        ))

for user in user_objs:
    for _ in range(NUM_DETECTION_PER_USER):
        crud.create_detection_result(db, schemas.DetectionResultCreate(
            user_id=user.id,
            food_id=choice(food_objs).id,
            image_path=f"/images/food_{randint(1, 100)}.jpg",
            confidence=round(uniform(0.7, 0.99), 2)
        ))

for user in user_objs:
    for _ in range(NUM_LOGS_PER_USER):
        crud.create_user_log(db, schemas.UserLogCreate(
            user_id=user.id,
            action=choice(["view", "like", "create"]),
            target_id=randint(1, 10),
            target_type=choice(["recipe", "review", "food"]),
            meta={"info": fake.word()}
        ))

for user in user_objs:
    for _ in range(NUM_INGREDIENT_INPUT_PER_USER):
        input_obj = crud.create_user_ingredient_input(db, schemas.UserIngredientInputCreate(
            user_id=user.id,
            input_text=", ".join(fake.words(nb=3)),
            matched_food_ids=[choice(food_objs).id]
        ))
        crud.create_user_ingredient_input_recipe(db, schemas.UserIngredientInputRecipeCreate(
            input_id=input_obj.id,
            recipe_id=choice(recipe_objs).id,
            rank=randint(1, 5)
        ))

db.close()
print("✅ 시드 데이터 삽입 완료")
