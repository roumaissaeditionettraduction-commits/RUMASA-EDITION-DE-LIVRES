import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';

// 1. تشغيل اتصال قوقل السحابي بالمفاتيح المباشرة التي ولدتها لـ Roumaissa Édition
const firebaseConfig = {
  apiKey: "AIzaSyCUFqZlnWT1Cy5Ycq0OBJG1_TFpIBmirZQ", 
  authDomain: "://firebaseapp.com",
  projectId: "maisoneditionrumaysa",
  storageBucket: "://appspot.com",
  messagingSenderId: "389274920184", // ضع هنا الأرقام الخاصة بـ messagingSenderId من شاشتك
  appId: "1:389274920184:web:..." // ضع هنا كود appId الخاص بك
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Book {
  id: string; title: string; price: number; description: string; isBestSeller: boolean;
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);

  // 2. المزامنة اللحظية الفورية الحية: جلب البيانات في نفس الثانية بين الهاتف والكمبيوتر
  useEffect(() => {
    const q = query(collection(db, "books"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const booksArray: Book[] = [];
      querySnapshot.forEach((doc) => {
        booksArray.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(booksArray); // التحديث الفوري للواجهة عند إضافة أي كتاب من الهاتف
    });
    return () => unsubscribe();
  }, []);

  // 3. الحماية الحديدية للأدمن ومنع نسخ ونقل نصوص الكتب للزوار
  useEffect(() => {
    const isAdmin = window.location.href.includes('admin') || localStorage.getItem('user_role') === 'admin';
    if (!isAdmin) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      const preventAction = (e: Event) => e.preventDefault();
      window.addEventListener('copy', preventAction);
      window.addEventListener('contextmenu', preventAction);
      return () => {
        window.removeEventListener('copy', preventAction);
        window.removeEventListener('contextmenu', preventAction);
      };
    }
  }, []);

  const bestSeller = books.find(b => b.isBestSeller === true) || {
    title: "رواية رماد الأندلس: سيرة الغائبين", price: 1160, description: "ملحمة أدبية خاصة بدار رميسة للنشر."
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right p-4" dir="rtl">
      <header className="bg-amber-700 text-white p-4 text-center text-2xl font-bold rounded shadow">
        Roumaissa Édition - دار رميسة للنشر والترجمة
      </header>
      <main className="max-w-4xl mx-auto my-6">
        <div className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">الرواية الأكثر مبيعاً</span>
            <h1 className="text-3xl font-black my-2">{bestSeller.title}</h1>
            <p className="text-gray-600">{bestSeller.description}</p>
            <div className="text-2xl font-bold text-amber-700 my-2">{bestSeller.price} دج</div>
          </div>
          <div className="border p-4 rounded bg-gray-50 flex flex-col justify-center">
            <button onClick={() => alert("يجب إتمام عملية الشراء عبر كارد الذهبية أولاً تحميل ملف الـ ePub.")} className="bg-amber-600 text-white py-2 rounded font-bold">
              📥 تحميل ملف الـ ePub المرخص
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
