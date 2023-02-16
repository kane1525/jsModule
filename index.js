const events = [
  {
    start: 0,
    duration: 30,
    title: 'Exercise',
  },
  {
    start: 25,
    duration: 300,
    title: 'Travel to work',
  },
  {
    start: 70,
    duration: 50,
    title: 'Plan day',
  },
  {
    start: 130,
    duration: 60,
    title: "Review yesterday's commits",
  },
  {
    start: 200,
    duration: 60,
    title: "Review yesterday's commits",
  },
  {
    start: 360,
    duration: 30,
    title: 'Skype call',
  },
  {
    start: 400,
    duration: 45,
    title: 'Follow up with designer',
  },
  {
    start: 450,
    duration: 30,
    title: 'Push up branch',
  },
];

class Event {
  prev = []; // массив ивентов, которые совпадают по времени с текущим
  allEventsStartedBeforeThis = [];
  leftOffset = 0;

  constructor({ start, duration, title }) {
    this.id = Event.id++;
    this.startTime = start;
    this.duration = duration;
    this.title = title;
    this.width = Event.maxWidth;
  }

  static id = 0;
  static maxWidth = 200; // дефолтная максимальная ширина события
  static kof = 2;

  get topOffset() {
    return this.startTime * Event.kof;
  }

  get height() {
    return this.duration * Event.kof;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
    if (this.prev.length > 0) {
      this.prev.forEach((event) => (event.width = value));
    }
  }

  clearPrevs() {
    this.prev.splice(0, this.prev.length);
  }

  setPrevEvents(shedule) {
    const itemIndex = shedule.findIndex((item) => item.id === this.id);

    for (let i = 0; i < shedule.length; i++) {
      if (i < itemIndex) {
        if (shedule[i].endTime >= this.startTime) {
          this.prev.push(shedule[i]);
        }
      }
    }
  }

  setWidthAndLeft(shedule) {
    shedule.forEach((e) => {
      if (e.prev.length === 0) {
        this.width = Event.maxWidth;
        this.leftOffset = 0;
        return;
      }
      // Если мы дошли сюда, значит в приве что то есть
      // сначала сделаем, если то что в приве нужно изменить

      const minPrevWidth = e.prev.reduce((accum, next) => {
        return next.width > accum ? accum : next.width;
      }, Infinity);
      if (minPrevWidth > Math.floor(Event.maxWidth / (e.prev.length + 1))) {
        e.width = Math.floor(Event.maxWidth / (e.prev.length + 1));
        e.leftOffset =
          Math.floor(Event.maxWidth / (e.prev.length + 1)) * e.prev.length;
        e.prev.forEach((prevEvent, i) => {
          prevEvent.width = Math.floor(Event.maxWidth / (e.prev.length + 1));
          const variantsOfLeftOffset = [];
          for (
            let i = 0;
            i < Math.floor(Event.maxWidth / prevEvent.width);
            i++
          ) {
            variantsOfLeftOffset.push(
              Math.floor(Event.maxWidth / (e.prev.length + 1)) * i
            );
          }
          let last = 10000;
          let res = null;
          for (let variant of variantsOfLeftOffset) {
            if (
              prevEvent.leftOffset - variant > 0 &&
              prevEvent.leftOffset - variant < last
            ) {
              last = prevEvent.leftOffset - variant;
              res = variant;
            }
          }
          if (prevEvent.leftOffset !== 0) {
            prevEvent.leftOffset = res;
          }
        });
        return;
      }

      // если у прива ширина меньше, чем по расчету, значит у него есть
      // дырка и нужно ее найти

      if (minPrevWidth < Math.floor(Event.maxWidth / (e.prev.length + 1))) {
        e.width = minPrevWidth;
      } else {
        e.width = Math.floor(Event.maxWidth / (e.prev.length + 1));
      }
      // И если мы не зашли никуда до этого, значит у нас что то есть в приве
      // но оно уже правильных размеров

      const variantsToPass = [];

      for (let i = 0; i < Math.floor(Event.maxWidth / minPrevWidth); i++) {
        variantsToPass.push(minPrevWidth * i);
      }
      const filteredVariants = variantsToPass.filter((variant) => {
        const isNotFree = e.prev.some((el) => el.leftOffset === variant);
        return !isNotFree;
      });
      e.leftOffset = filteredVariants[0];
    });
  }
}
// конец класса

// Shedule
class Shedule {
  constructor(events, sheduler) {
    this.eventsContainer = sheduler.querySelector('.events');
    this.events = events.map((event) => new Event(event));
    this.prepareForRender();
    this.renderEvents();
  }

  sortEvents() {
    this.events.sort((a, b) => a.startTime - b.startTime);
  }

  clearAllPrevs() {
    this.events.forEach((e) => e.clearPrevs());
  }

  setAllPrevs() {
    this.events.forEach((e) => e.setPrevEvents(this.events));
  }

  setAllWidthAndLeft() {
    this.events.forEach((e) => e.setWidthAndLeft(this.events));
  }

  prepareForRender() {
    this.clearAllPrevs();
    this.setAllPrevs();
    this.setAllWidthAndLeft();
  }

  renderEvents() {
    this.eventsContainer.innerHTML = '';
    this.events.forEach((e) => {
      const event = document.createElement('div');
      event.classList.add('event');
      event.innerHTML = `
        <i class="fa-sharp fa-solid fa-xmark"></i>
        ${e.title}
      `;
      event.style.cssText = `height:${e.height}px;width:${e.width}px;left:${e.leftOffset}px;top:${e.topOffset}px;`;
      event.querySelector('i').addEventListener('click', () => {
        this.removeEvent(e);
      });
      this.eventsContainer.appendChild(event);
    });
    console.log(this.events);
  }

  addEvent(event) {
    this.events.push(new Event(event));
    this.sortEvents();
    this.prepareForRender();
    this.renderEvents();
  }

  removeEvent(event) {
    this.events = this.events.filter((e) => e.id !== event.id);
    this.sortEvents();
    this.prepareForRender();
    this.renderEvents();
  }
}

// End of Shedule
const sheduler = document.querySelector('.sheduler');
const shedule = new Shedule(events, sheduler);

// рендерим время
function renderTime(from, amount) {
  let time = from;
  const container = document.querySelector('.time-list');
  for (let i = 0; i <= amount * 2; i++) {
    const li = document.createElement('li');
    li.classList.add('time-cell');
    if (i % 2 === 0) {
      li.classList.add('time-cell_big');
      li.innerHTML = `<span class="time-span">${time}:00</span>`;
      container.appendChild(li);
    } else {
      li.classList.add('time-cell_little');
      li.innerHTML = `<span class="time-span">${time}:30</span>`;
      container.appendChild(li);
      time = time < 12 ? time + 1 : 1;
    }
  }
}

renderTime(8, 9);
// рендерим время

// form

const startInput = document.querySelector('#start-time');
const endInput = document.querySelector('#end-time');
const nameInput = document.querySelector('#event-name');
const submitBtn = document.querySelector('#submit-btn');

function convertTime(str) {
  const arr = str.split(':');
  const hours = Number(arr[0]) - 8;
  const minutes = Number(arr[1]);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes;
}

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (convertTime(startInput.value) < 0 || convertTime(endInput.value) > 540) {
    return;
  }
  const start = convertTime(startInput.value);
  const duration = convertTime(endInput.value) - convertTime(startInput.value);
  const title = nameInput.value;
  shedule.addEvent({ start, duration, title });
});
