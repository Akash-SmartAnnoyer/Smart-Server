# Migration Notes: Firebase to MongoDB

## Key Changes

### Database Structure

**Firebase (Firestore):**
- Collections: `restaurants`, `menu_items`, `categories`, `orders`, `history`
- Subcollections: `restaurants/{id}/charges`
- Document IDs: Auto-generated

**MongoDB:**
- Collections: `restaurants`, `menuitems`, `categories`, `orders`, `histories`
- Embedded documents: `restaurants.charges[]` (array)
- Document IDs: `_id` (ObjectId)

### API Changes

**Old (Firebase):**
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
const q = query(collection(db, 'restaurants'), where('orgId', '==', orgId));
const snapshot = await getDocs(q);
```

**New (MongoDB API):**
```javascript
import api from '../services/api';
const restaurant = await api.getRestaurant(orgId);
```

### Data Format Changes

1. **IDs:** Firebase uses string IDs, MongoDB uses `_id` (ObjectId)
   - Frontend converts `_id` to `id` for compatibility

2. **Nested Data:** Charges are now embedded in restaurant document
   - No subcollections needed

3. **Timestamps:** MongoDB uses `createdAt` and `updatedAt` automatically

## Component Updates Needed

The following components need to be updated to use the new API:

1. ✅ `RestaurantManagement.jsx` - Updated
2. ⏳ `MenuManagement.jsx` - Needs update
3. ⏳ `MenuContext.jsx` - Needs update
4. ⏳ `OrderContext.jsx` - Needs update
5. ⏳ `AdminOrderContext.jsx` - Needs update
6. ⏳ `RestaurantDashboard.jsx` - Needs update
7. ⏳ `ChargesManagement.jsx` - Needs update
8. ⏳ `OrderConfirmation.jsx` - Needs update
9. ⏳ `WaitingScreen.jsx` - Needs update
10. ⏳ `SummaryView.jsx` - Needs update
11. ⏳ `NewOrderHistory.jsx` - Needs update
12. ⏳ `AllOrdersSummary.jsx` - Needs update
13. ⏳ `MenuProvider.jsx` - Needs update
14. ⏳ `OrderSummary.jsx` - Needs update

## Migration Strategy

1. **Phase 1:** Backend setup ✅
2. **Phase 2:** API service layer ✅
3. **Phase 3:** Update RestaurantManagement ✅
4. **Phase 4:** Update remaining components
5. **Phase 5:** Remove Firebase dependencies
6. **Phase 6:** Data migration (if needed)

## Testing Checklist

For each component:
- [ ] Can fetch data
- [ ] Can create new records
- [ ] Can update existing records
- [ ] Can delete records
- [ ] Error handling works
- [ ] Loading states work

## Common Patterns

### Fetching Data
```javascript
// Old
const snapshot = await getDocs(query(collection(db, 'items'), where('orgId', '==', orgId)));
const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// New
const items = await api.getMenuItems(orgId);
```

### Creating Data
```javascript
// Old
await setDoc(doc(db, 'items', id), data);

// New
await api.createMenuItem(orgId, data);
```

### Updating Data
```javascript
// Old
await updateDoc(doc(db, 'items', id), updateData);

// New
await api.updateMenuItem(orgId, id, updateData);
```

### Real-time Updates

Firebase `onSnapshot` needs to be replaced with:
- Polling (setInterval)
- WebSockets (if needed)
- Server-Sent Events (SSE)

For now, components can use polling or manual refresh.

