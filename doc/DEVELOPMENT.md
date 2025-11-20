### Процесс разработки

1. **Выбор задачи:**

   - Бери задачу из колонки "Tasks" на GitHub Projects
   - Перетащи в "In review" и назначь на себя

2. **Создание ветки:**

   - git checkout development
   - git pull origin development
   - git checkout -b feature/15-short-description

3. **Разработка:**

   - Указывай номер задачи: git commit -m "feat: #15 add login form"
   - Если хочешь взять еще одну задачу, измени имя ветки на feature/15-16-short-description и указывай это в коммите: git commit -m "feat: #15 #16 add login form, add routing"

4. **Создание PR:**

   - Пуш ветку: git push origin feature/15-short-description

   - Создай PR через GitHub (появится кнопка после пуша)

   - В описании укажи: "Closes #15"

   - Добавь 2 ревьюверов из команды

   