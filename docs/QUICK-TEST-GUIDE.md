# 🚀 QUICK TEST GUIDE - LUXEWAY FRONTEND

## ✅ CHECKLIST - Test Các Tính Năng Mới

### 1. **Dark/Light Mode** 🌓

#### Test Steps:
1. Mở frontend: http://localhost:5173/
2. Tìm nút **Sun/Moon icon** ở navbar (góc phải)
3. Click để toggle theme
4. ✅ **Expected**: 
   - Theme chuyển đổi mượt mà (300ms transition)
   - Tất cả màu sắc thay đổi
   - Icon animation (rotate 180°)
   - Theme được lưu (refresh page vẫn giữ theme)

#### Test Cases:
- [ ] Click toggle → Theme changes
- [ ] Refresh page → Theme persists
- [ ] Navigate to other pages → Theme consistent
- [ ] Check all components (cards, buttons, inputs) → All styled correctly

---

### 2. **Multi-Language** 🌍

#### Test Steps:
1. Tìm nút **Globe icon** với flag ở navbar
2. Click để mở dropdown
3. Chọn language (English 🇺🇸 hoặc Tiếng Việt 🇻🇳)
4. ✅ **Expected**:
   - Dropdown animation mượt
   - Language changes immediately
   - All text updates
   - Language persists after refresh

#### Test Cases:
- [ ] Switch EN → VI → All text changes
- [ ] Switch VI → EN → All text changes
- [ ] Refresh page → Language persists
- [ ] Navigate pages → Language consistent
- [ ] Check all pages (Home, Marketplace, Dashboard) → All translated

---

### 3. **Real Authentication** 🔐

#### Test Steps:
1. Click **"Sign In"** button
2. Use test account:
   ```
   Email: nguyen.van.a@gmail.com
   Password: password
   ```
3. Click **"Sign In"**
4. ✅ **Expected**:
   - Loading state shows
   - Success toast appears
   - Redirect to dashboard
   - User info shows in navbar
   - Token saved in localStorage

#### Test Cases:
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Error message
- [ ] Logout → Redirect to home
- [ ] Refresh after login → Still logged in
- [ ] Token expiry → Auto logout

#### Test Accounts:
```
Customer: nguyen.van.a@gmail.com / password
Owner:    pham.minh.d@gmail.com / password
Admin:    admin@luxeway.vn / password
```

---

### 4. **Admin Dashboard** 👑

#### Test Steps:
1. Login as admin: `admin@luxeway.vn / password`
2. Navigate to: http://localhost:5173/admin
3. ✅ **Expected**:
   - Dark gradient sidebar
   - Stats cards with animations
   - Quick actions section
   - System health indicators
   - Recent activity feed

#### Test Cases:
- [ ] Login as admin → Can access /admin
- [ ] Login as customer → Cannot access /admin (redirect)
- [ ] Sidebar navigation works
- [ ] Stats display correctly
- [ ] Quick actions clickable
- [ ] Dark theme looks good

---

### 5. **SASS Animations** ✨

#### Test Steps:
1. Navigate through different pages
2. Hover over cards, buttons
3. Scroll pages
4. ✅ **Expected**:
   - Smooth fade-in animations
   - Hover lift effects on cards
   - Button hover animations
   - Smooth page transitions

#### Test Cases:
- [ ] Cards have hover lift effect
- [ ] Buttons have hover scale
- [ ] Page load animations smooth
- [ ] Scrollbar styled correctly
- [ ] Loading shimmer effect works

---

### 6. **Customer Dashboard** 👤

#### Test Steps:
1. Login as customer: `nguyen.van.a@gmail.com / password`
2. Navigate to: http://localhost:5173/dashboard
3. ✅ **Expected**:
   - Stats cards (bookings, rentals, etc.)
   - Recent bookings list
   - Notifications panel
   - Profile section

#### Test Cases:
- [ ] Dashboard loads correctly
- [ ] Stats display
- [ ] Sidebar navigation works
- [ ] Profile page accessible
- [ ] Settings page accessible

---

### 7. **Owner Dashboard** 🚗

#### Test Steps:
1. Login as owner: `pham.minh.d@gmail.com / password`
2. Navigate to: http://localhost:5173/owner
3. ✅ **Expected**:
   - Vehicle management section
   - Booking management
   - Revenue stats
   - Calendar view

#### Test Cases:
- [ ] Owner dashboard accessible
- [ ] Different from customer dashboard
- [ ] Vehicle list shows
- [ ] Booking list shows

---

### 8. **Navbar Enhancements** 🎨

#### Test Steps:
1. Check navbar on different pages
2. Test all navbar buttons
3. ✅ **Expected**:
   - Theme toggle works
   - Language switcher works
   - User menu dropdown smooth
   - Notifications badge shows
   - Mobile menu responsive

#### Test Cases:
- [ ] Theme toggle visible and works
- [ ] Language switcher visible and works
- [ ] User menu opens smoothly
- [ ] Notifications icon shows count
- [ ] Messages icon clickable
- [ ] Mobile menu works (< 1024px)

---

### 9. **Backend Integration** 🔌

#### Test Steps:
1. Navigate to: http://localhost:5173/test-backend
2. Click test buttons
3. ✅ **Expected**:
   - Health check returns data
   - Users API returns data
   - Vehicles API returns data
   - Backend status shows "Connected"

#### Test Cases:
- [ ] Backend status indicator works
- [ ] Health check button works
- [ ] Users API test works
- [ ] Vehicles API test works
- [ ] Error handling works (stop backend and test)

---

### 10. **Responsive Design** 📱

#### Test Steps:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes
4. ✅ **Expected**:
   - Mobile menu appears < 1024px
   - Cards stack on mobile
   - Text readable on all sizes
   - Buttons accessible

#### Test Cases:
- [ ] Desktop (1920px) → All features visible
- [ ] Laptop (1366px) → Layout adjusts
- [ ] Tablet (768px) → Mobile menu shows
- [ ] Mobile (375px) → Everything accessible

---

## 🎯 PRIORITY TEST SEQUENCE

### Quick Test (5 minutes)
1. ✅ Dark/Light mode toggle
2. ✅ Language switcher
3. ✅ Login as customer
4. ✅ Check dashboard

### Full Test (15 minutes)
1. ✅ All authentication flows
2. ✅ All dashboard types (Customer, Owner, Admin)
3. ✅ Theme persistence
4. ✅ Language persistence
5. ✅ Backend integration
6. ✅ Responsive design

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Theme not changing
**Solution:**
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh page

### Issue 2: Language not changing
**Solution:**
- Check if translations file loaded
- Clear localStorage
- Refresh page

### Issue 3: Login fails
**Solution:**
- Check backend is running (port 8080)
- Check network tab in DevTools
- Verify test account credentials

### Issue 4: Admin dashboard not accessible
**Solution:**
- Make sure logged in as admin
- Check user role in localStorage
- Try logout and login again

### Issue 5: Animations not smooth
**Solution:**
- Check if `theme.scss` is imported
- Clear browser cache
- Check for CSS conflicts

---

## 📊 EXPECTED RESULTS

### Performance
- ✅ Page load < 2s
- ✅ Theme switch < 300ms
- ✅ Language switch instant
- ✅ Login < 1s (with backend)
- ✅ Smooth 60fps animations

### Visual
- ✅ No layout shifts
- ✅ Consistent spacing
- ✅ Proper contrast (WCAG AA)
- ✅ Smooth transitions
- ✅ Beautiful hover effects

### Functionality
- ✅ All buttons clickable
- ✅ All forms submittable
- ✅ All links working
- ✅ All dropdowns opening
- ✅ All modals closing

---

## 🎨 VISUAL CHECKLIST

### Light Mode
- [ ] White backgrounds
- [ ] Dark text (#0F172A)
- [ ] Blue accent (#3B82F6)
- [ ] Subtle shadows
- [ ] Clean borders

### Dark Mode
- [ ] Dark backgrounds (#0F172A, #1E293B)
- [ ] Light text (#F8FAFC)
- [ ] Lighter accent (#60A5FA)
- [ ] Stronger shadows
- [ ] Visible borders

---

## 🚀 NEXT STEPS AFTER TESTING

### If Everything Works:
1. ✅ Commit changes to git
2. ✅ Deploy to staging
3. ✅ Show to team
4. ✅ Get feedback
5. ✅ Plan next features

### If Issues Found:
1. 🐛 Document the issue
2. 🔍 Check browser console
3. 📝 Note reproduction steps
4. 💬 Report to developer
5. 🔧 Wait for fix

---

## 📞 SUPPORT

### Documentation
- [FRONTEND-UPGRADE-SUMMARY.md](FRONTEND-UPGRADE-SUMMARY.md) - What was upgraded
- [START-PROJECT.md](START-PROJECT.md) - How to run project
- [SUMMARY.md](SUMMARY.md) - Project overview

### Test URLs
```
Frontend:        http://localhost:5173/
Backend:         http://localhost:8080/api/v1
Backend Test:    http://localhost:5173/test-backend
Admin Dashboard: http://localhost:5173/admin
Customer Dash:   http://localhost:5173/dashboard
Owner Dash:      http://localhost:5173/owner
```

### Test Accounts
```
Admin:    admin@luxeway.vn / password
Customer: nguyen.van.a@gmail.com / password
Owner:    pham.minh.d@gmail.com / password
```

---

## ✨ BONUS FEATURES TO TEST

### 1. Glassmorphism Effects
- Look for blurred backgrounds
- Check navbar transparency
- Test modal overlays

### 2. Smooth Scrolling
- Scroll pages
- Check smooth behavior
- Test anchor links

### 3. Loading States
- Watch for shimmer effects
- Check skeleton loaders
- Test loading spinners

### 4. Toast Notifications
- Login/logout → Toast appears
- Form submit → Toast shows
- Error → Error toast

### 5. Hover Effects
- Hover cards → Lift effect
- Hover buttons → Scale effect
- Hover links → Color change

---

**Happy Testing! 🎉**
**LuxeWay - Drive Your Dreams** 🚗✨
