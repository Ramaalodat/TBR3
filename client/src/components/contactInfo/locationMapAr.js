import { useState, useEffect } from "react";

export default function LocationMap({ onLocationSelect, initialLocation = '' }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [subLocation, setSubLocation] = useState('');

  const jordanRegions = {
    amman: { name: 'Amman', label: 'عمان' },
    zarqa: { name: 'Zarqa', label: 'الزرقاء' },
    irbid: { name: 'Irbid', label: 'إربد' },
    salt: { name: 'Salt', label: 'السلط' },
    madaba: { name: 'Madaba', label: 'مادبا' },
    jerash: { name: 'Jerash', label: 'جرش' },
    ajloun: { name: 'Ajloun', label: 'عجلون' },
    karak: { name: 'Karak', label: 'الكرك' },
    tafilah: { name: 'Tafilah', label: 'الطفيلة' },
    maan: { name: 'Ma’an', label: 'معان' },
    aqaba: { name: 'Aqaba', label: 'العقبة' },
    mafraq: { name: 'Mafraq', label: 'المفرق' }
  };

  useEffect(() => {
    if (initialLocation) {
      const [regionName, subLoc = ''] = initialLocation.split(" - ");
      const regionId = Object.keys(jordanRegions).find(
        key => jordanRegions[key].name.toLowerCase() === regionName.toLowerCase()
      );
      if (regionId) {
        setSelectedRegion(regionId);
        setSubLocation(subLoc);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    if (selectedRegion !== '' && subLocation !== '') {
      const fullLocation = `${jordanRegions[selectedRegion].name} - ${subLocation}`;
      onLocationSelect(fullLocation);
    } else if (selectedRegion !== '') {
      onLocationSelect(jordanRegions[selectedRegion].name);
    }
  }, [selectedRegion, subLocation]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSubLocation('');
  };

  const handleSubLocationChange = (e) => {
    setSubLocation(e.target.value);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          اختر المحافظة
        </label>
        <select
          id="region"
          className="block w-full mt-1 border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={handleRegionChange}
          value={selectedRegion}
        >
          <option value="" disabled>-- اختر المحافظة --</option>
          {Object.entries(jordanRegions).map(([id, region]) => (
            <option key={id} value={id}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      {selectedRegion && (
        <div>
          <label htmlFor="sub-location" className="block text-sm font-medium text-gray-700 mb-1">
            المنطقة الفرعية
          </label>
          <input
            id="sub-location"
            type="text"
            className="block w-full border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="مثال: تلاع العلي"
            value={subLocation}
            onChange={handleSubLocationChange}
          />
        </div>
      )}
    </div>
  );
}
