import { useMemo, useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import {
  DISHES,
  MENU_CATEGORIES,
  MenuCategory,
} from '../data/restaurantData';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { ResilientImage } from './ResilientImage';

interface MenuSectionProps {
  onReserveClick: () => void;
}

function formatPriceLocalized(amount: number, currency: string): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currency}`;
}

export function MenuSection({ onReserveClick }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const localizedDishes = useMemo(() => {
    return DISHES.map((dish) => {
      const tr = t.dishes[dish.id];
      return {
        ...dish,
        displayName: tr?.name || dish.name,
        displayDescription: tr?.description || dish.description,
        displayPortion: tr?.portion || dish.portion,
        displayPrepTime: tr?.prepTime || dish.prepTime,
        displayCategory: t.menu.categories[dish.category] || dish.category,
      };
    });
  }, [t]);

  const filteredDishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return localizedDishes.filter((dish) => {
      const matchesCategory =
        selectedCategory === 'Barchasi' || dish.category === selectedCategory;
      const matchesQuery =
        !query ||
        dish.displayName.toLowerCase().includes(query) ||
        dish.displayDescription.toLowerCase().includes(query) ||
        dish.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [localizedDishes, selectedCategory, searchQuery]);

  const featuredDishes = filteredDishes.filter((d) => d.featured);
  const standardDishes = filteredDishes.filter((d) => !d.featured);

  return (
    <section id="menyu" className="py-12 sm:py-16 lg:py-20 bg-[#f8f9f8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-[#115E46] tracking-wide mb-2">
              {t.menu.eyebrow}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight text-balance">
              {t.menu.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-[58ch]">
              {t.menu.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onReserveClick}
            className="inline-flex items-center justify-center gap-2.5 px-5 min-h-[48px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer w-full md:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            <CalendarCheck className="w-4 h-4" aria-hidden="true" />
            <span>{t.menu.reserveBtn}</span>
          </button>
        </div>

        <div className="mt-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div
            role="tablist"
            aria-label={t.menu.eyebrow}
            className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto no-scrollbar"
          >
            {MENU_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 min-h-[40px] text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.menu.categories[category]}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.menu.searchPlaceholder}
              aria-label={t.menu.searchPlaceholder}
              className="w-full pl-10 pr-4 min-h-[44px] text-base sm:text-sm bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#115E46]"
            />
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="py-14 text-center bg-white border border-stone-200 rounded-xl mt-8 px-4">
            <p className="text-base font-medium text-stone-800">
              {t.menu.emptyTitle}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {t.menu.emptySubtitle}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Barchasi');
                setSearchQuery('');
              }}
              className="mt-4 px-5 min-h-[44px] text-sm font-medium text-white bg-[#115E46] rounded-lg hover:bg-[#0D4A37] transition-colors cursor-pointer"
            >
              {t.menu.resetBtn}
            </button>
          </div>
        ) : (
          <>
            {featuredDishes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-medium text-stone-500 mb-4">
                  {t.menu.chefPicksLabel}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {featuredDishes.map((dish) => (
                    <article
                      key={dish.id}
                      className="flex flex-col justify-between bg-white border border-stone-200 rounded-xl overflow-hidden"
                    >
                      {dish.image && (
                        <div className="aspect-[16/10] w-full bg-stone-100 overflow-hidden border-b border-stone-100">
                          <ResilientImage
                            src={dish.image}
                            alt={dish.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs text-stone-500">
                            <span>{dish.displayCategory}</span>
                            <span aria-hidden="true" className="mx-1.5">
                              ·
                            </span>
                            <span className="tabular-nums">{dish.displayPortion}</span>
                          </p>
                          <h3 className="mt-1.5 font-sans text-base font-semibold text-stone-900 leading-snug">
                            {dish.displayName}
                          </h3>
                          <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                            {dish.displayDescription}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-stone-900 tabular-nums">
                            {formatPriceLocalized(dish.price, t.restaurant.currency)}
                          </span>
                          <span className="text-xs text-stone-500 tabular-nums">
                            {dish.displayPrepTime}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {standardDishes.length > 0 && (
              <div className="mt-8 bg-white border border-stone-200 rounded-xl divide-y divide-stone-200 md:grid md:grid-cols-2 md:divide-y-0">
                {standardDishes.map((dish, index) => (
                  <div
                    key={dish.id}
                    className={`p-5 sm:p-6 flex items-start justify-between gap-4 border-stone-200 ${
                      index % 2 === 0 ? 'md:border-r' : ''
                    } ${index < standardDishes.length - 2 ? 'md:border-b' : ''} ${
                      index === standardDishes.length - 2 &&
                      standardDishes.length % 2 !== 0
                        ? 'md:border-b'
                        : ''
                    }`}
                  >
                    {dish.image && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <ResilientImage
                          src={dish.image}
                          alt={dish.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-stone-500">
                        <span>{dish.displayCategory}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span className="tabular-nums">{dish.displayPortion}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span className="tabular-nums">{dish.displayPrepTime}</span>
                      </p>
                      <h3 className="mt-1 font-sans text-base font-semibold text-stone-900">
                        {dish.displayName}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                        {dish.displayDescription}
                      </p>
                      <p className="mt-2.5 text-sm font-semibold text-stone-900 tabular-nums">
                        {formatPriceLocalized(dish.price, t.restaurant.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
