import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

interface AreaItem {
  id: string;
  name: string;
  city: string;
  count: number;
  image: string;
  districtParam: string;
  cityParam: string;
}

const areas: AreaItem[] = [
  {
    id: "binh-thanh",
    name: "Quận Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    count: 128,
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận Bình Thạnh",
    cityParam: "TP. Hồ Chí Minh",
  },
  {
    id: "quan-1",
    name: "Quận 1 - Trung tâm",
    city: "TP. Hồ Chí Minh",
    count: 86,
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận 1",
    cityParam: "TP. Hồ Chí Minh",
  },
  {
    id: "thu-duc",
    name: "TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    count: 145,
    image:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
    districtParam: "TP. Thủ Đức",
    cityParam: "TP. Hồ Chí Minh",
  },
  {
    id: "quan-7",
    name: "Quận 7",
    city: "TP. Hồ Chí Minh",
    count: 92,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận 7",
    cityParam: "TP. Hồ Chí Minh",
  },
];

export function PopularAreas() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {areas.map((area) => (
        <Link
          key={area.id}
          href={`/listings?district=${encodeURIComponent(
            area.districtParam
          )}&city=${encodeURIComponent(area.cityParam)}`}
          className="group relative h-72 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          {/* Background image with hover zoom */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={area.image}
            alt={area.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

          {/* Top badge */}
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-4 w-4" />
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>{area.city}</span>
            </div>
            <h3 className="font-heading text-lg font-bold group-hover:text-emerald-300 transition-colors">
              {area.name}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {area.count}+ chỗ ở sẵn sàng
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
