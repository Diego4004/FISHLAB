# 🗑️ Добавление функции удаления фотографий

## 🎯 Что было сделано

Добавлена возможность удалять фотографии товаров, если случайно выбрана неправильная фотография.

## 📊 Изменения

### Файлы исправлены: 2
- `admin.html` - Добавлены кнопки удаления для фотографий
- `admin.js` - Добавлены обработчики для удаления фотографий

### Строки изменены: ~40

## ✅ Результат

✅ **Главная фотография товара** - можно удалить нажав на красный крестик  
✅ **Дополнительные фотографии** - можно удалить каждую отдельно  
✅ **Удобный интерфейс** - кнопка удаления появляется при наведении  

## 🔧 Основные изменения

### admin.html

#### 1. Главная фотография товара
```html
<div id="mainImagePreview" style="display: none; margin-top: 10px; position: relative; width: fit-content;">
    <img id="mainImagePreviewImg" style="max-width: 150px; border-radius: 10px; border: 2px solid var(--primary);">
    <button type="button" id="removeMainImage" style="position: absolute; top: -10px; right: -10px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        <i class="fas fa-times"></i>
    </button>
</div>
```

#### 2. Дополнительные фотографии
```html
<div id="additionalImagesPreview" style="display: none; margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;"></div>
```

### admin.js

#### 1. Удаление главной фотографии
```javascript
const removeMainImageBtn = document.getElementById('removeMainImage');
if (removeMainImageBtn) {
    removeMainImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentMainImageBase64 = '';
        productMainImageInput.value = '';
        mainImagePreview.style.display = 'none';
        mainImagePreviewImg.src = '';
    });
}
```

#### 2. Удаление дополнительных фотографий
```javascript
const removeBtn = document.createElement('button');
removeBtn.type = 'button';
removeBtn.style.cssText = 'position: absolute; top: -10px; right: -10px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;';
removeBtn.innerHTML = '<i class="fas fa-times"></i>';
removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const idx = currentAdditionalImagesBase64.indexOf(e.target.result);
    if (idx > -1) {
        currentAdditionalImagesBase64.splice(idx, 1);
    }
    container.remove();
    if (currentAdditionalImagesBase64.length === 0) {
        additionalImagesPreview.style.display = 'none';
        productAdditionalImagesInput.value = '';
    }
});
```

## 🚀 Как использовать

### Удалить главную фотографию товара

1. Откройте админ-панель
2. Перейдите в "Товари"
3. Нажмите "Додати товар" или отредактируйте существующий
4. Загрузите фотографию
5. Нажмите на красный крестик в углу фотографии
6. Фотография будет удалена

### Удалить дополнительную фотографию

1. Загрузите дополнительные фотографии
2. Каждая фотография будет иметь красный крестик в углу
3. Нажмите на крестик чтобы удалить фотографию
4. Если удалены все фотографии, поле ввода очистится

## 📝 Примечания

- Кнопка удаления появляется только когда фотография загружена
- Удаление фотографии не сохраняется автоматически - нужно нажать "Зберегти товар"
- Можно удалить и главную, и дополнительные фотографии
- При удалении всех дополнительных фотографий поле ввода очищается

## ✅ Статус

- **Версия**: 1.6
- **Дата**: 01.06.2026
- **Статус**: ✅ Готово к использованию

---

**Готово!** Функция удаления фотографий добавлена и готова к использованию.
