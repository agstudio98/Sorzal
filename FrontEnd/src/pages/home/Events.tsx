import { Component } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export class HomeEvents extends Component {
  render() {
    const events = [
      { id: 1, title: "Workshop: Fotografía Celestial", date: "25 Abr", time: "18:00", location: "Online", img: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80" },
      { id: 2, title: "Lanzamiento Marketplace v2", date: "02 May", time: "20:00", location: "Live Stream", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80" },
    ];

    return (
      <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <h2 className="title text-5xl text-primary-dark dark:text-white mb-12">PRÓXIMOS EVENTOS</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {events.map((event) => (
            <div key={event.id} className="flex-1 glass-card flex flex-col md:flex-row overflow-hidden group hover:shadow-2xl transition-shadow">
              <div className="md:w-1/2 overflow-hidden">
                <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary-light font-bold mb-4">
                    <Calendar size={18} />
                    <span>{event.date}</span>
                    <span className="mx-2">|</span>
                    <Clock size={18} />
                    <span>{event.time}</span>
                  </div>
                  <h3 className="title text-3xl text-primary-dark dark:text-white mb-4 leading-tight">{event.title}</h3>
                  <div className="flex items-center gap-2 opacity-60">
                    <MapPin size={18} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <button className="mt-8 px-6 py-2 bg-primary-light text-white rounded-full title hover:bg-primary-dark transition-colors w-max">
                  RESERVAR LUGAR
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
