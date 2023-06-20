'use strict'
window.addEventListener('DOMContentLoaded', () => {
    //tabs
    let menuType =  document.querySelector('.tabheader__items'),
        tabs = document.querySelectorAll('.tabheader__item'),
        tabContent = document.querySelectorAll('.tabcontent');
    
    function hideContent() {
        tabContent.forEach((item) => {
            item.style.display = 'none'
        })

        tabs.forEach((item) => {
            item.classList.remove('tabheader__item_active')
        })
    }

    hideContent()
    

    function showContent(i = 0) {
        tabContent[i].classList.add('anim-tab')
        tabContent[i].style.display = 'block'
        tabs[i].classList.add('tabheader__item_active')
    }
    showContent()

    menuType.addEventListener('click',(event) => {
        let target = event.target;
        tabs.forEach((item, i) => {
            if (target && target.classList.contains('tabheader__item') && item == target) {
                hideContent();
                showContent(i);
            }  
        })       
    })

    //timer

    let d = document.getElementById('days'),
        h = document.getElementById('hours'),
        m = document.getElementById('minutes'),
        s = document.getElementById('seconds'),
        deadLine = new Date('2023-05-16');

        // deadLine = new Date(Date.now() + 10000);
    
    
    function withZeros (t) {
        let str = '' + t
        if (str.length === 1) {
            return '0' + str;
            
        } else return str;
    }
    
        function getTimer() {
        let nowStamp = Date.now(),
            result = new Date();
            result.setTime(deadLine.getTime() - nowStamp)
        return result;
    }


    function setTimer(t) {
        d.textContent = withZeros(t.getUTCDate()-1);
        h.textContent = withZeros(t.getUTCHours());
        m.textContent = withZeros(t.getUTCMinutes());
        s.textContent = withZeros(t.getUTCSeconds());
    }
    
    function setT() {
        let time = getTimer();
        if (time.getTime() < 1000) {
            clearInterval(myTimer);
            setTimer(new Date(0))
        } else {
            time.setTime(time.getTime() - 1000);
            setTimer(time);
        }
    }

    let myTimer = setInterval(setT,1000);

    setT(); 
    
  // modal window
    let modalOpen = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal'),
        modalClose = document.querySelectorAll('[data-close-modal]');

    modalOpen.forEach((item) => {
        item.addEventListener('click', () => {
            openModal();
        })
    })

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden'; 
        // clearInterval(modalTimer)
    }

    function closeModal() {
        document.body.style.overflow = '';
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.querySelector('.modal__dialog').classList.add('show');
        document.querySelectorAll('.modal__dialog')[0].classList.remove('hide');
        try {
            document.querySelectorAll('.modal__dialog')[1].remove();
        } catch {}
        clearInterval(hideMessageTimer);

    }

    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.hasAttribute('data-close-modal')) {
            closeModal();
        }
    })
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    })

    // const modalTimer = setTimeout(openModal, 5000);


    function showModalByScroll() {
        if (document.documentElement.scrollTop > document.documentElement.scrollHeight - document.documentElement.clientHeight) {
            openModal()
            window.removeEventListener('scroll', showModalByScroll)
        } 
    }

    window.addEventListener('scroll', showModalByScroll);
  
    
    //Classes for menu cards

    class MenuItem {
        constructor (img, alt, title, description, price, parentDiv, ...rest){
            this.img = img;
            this.alt = alt;
            this.title = title;
            this.description = description;
            this.price = price;     
            this.parentDiv = parentDiv;
            this.classes = rest;
        }

        render() {
            let s = document.createElement('div')
            s. innerHTML = `<img src="${this.img}" alt="${this.alt}">
                            <h3 class="menu__item-subtitle">Меню "${this.title}"</h3>
                            <div class="menu__item-descr">Меню ${this.description}</div>
                            <div class="menu__item-divider"></div>
                            <div class="menu__item-price">
                                <div class="menu__item-cost">Цена:</div>
                                <div class="menu__item-total"><span>${this.price}</span> руб/день</div>
                            </div>`
            s.classList.add('menu__item', ...this.classes)
            this.parentDiv.append(s)
            return s
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error (`could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json()
    }

    let divMenu = document.querySelector('.menu__field > .container')
    divMenu.innerHTML = '';

    getResource('http://localhost:3000/menu')
    .then(data => {
        data.forEach(({img, altimg, title, descr, price}) => {
            new MenuItem(img, altimg, title, descr, price, divMenu).render()   
        })
    });


    //forms
    const forms = document.querySelectorAll('form'),
          message = {
            loading: 'img/form/spinner.svg',
            succses: 'Спасибо, скоро мы с вами свяжемся!',
            failure: 'Что-то пошло не так'
          };

    let hideMessageTimer;

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: data
        })

        return await res.json()
    }

    function bindPostData(form) {
        function nextModal (message) {
            let firstModalDialog = document.querySelector('.modal__dialog'),
                finalModalDialog = document.createElement('div');
            finalModalDialog.innerHTML = `
            <div class="modal__content">
                <div data-close-modal class="modal__close">&times;</div>
                <div class = "modal__title">${message}</div>    
            </div>
            `
            finalModalDialog.classList.add('modal__dialog');
            firstModalDialog.classList.add('hide')
            modal.append(finalModalDialog)
            document.querySelector('.spinner').remove();
        };


        form.addEventListener('submit',(e) => {
            e.preventDefault();
            
            let statusMessage = document.createElement('img'),
                formData = new FormData(form),
                inputs = form.querySelectorAll('input');
                
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend',statusMessage);
            statusMessage.classList.add('spinner')
            
            const json = JSON.stringify(Object.fromEntries(formData.entries()))


            postData('http://localhost:3000/requests', json)
            .then(data => {
                statusMessage.textContent = message.succses;
                openModal()
                nextModal(message.succses);
            }).catch(() => {
                openModal()
                nextModal(message.failure);
            }).finally(() => {
                inputs.forEach((item) => item.value = '');
                hideMessageTimer = setTimeout(closeModal,3000);
            })
        })
    }

    forms.forEach(bindPostData)


    // slider

    let offerSlider = document.querySelector('.offer__slider'),
        nextButton = document.querySelector('.offer__slider-next'),
        prevButton = document.querySelector('.offer__slider-prev'),
        currentSlideNumber = document.querySelector('#current'),
        totalSlideNumber = document.querySelector('#total'),
        slides = document.querySelectorAll('.offer__slide'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        slidesField = document.querySelector('.offer__slider-inner'),
        currentOffset = 0,
        width = window.getComputedStyle(offerSlider).width;
    if (+totalSlideNumber.textContent < 10) {
        totalSlideNumber.textContent = `0${slides.length}`;    
    } else {
        totalSlideNumber.textContent = `${slides.length}`;
    }
    
    currentSlideNumber.textContent = '01';
    slidesField.style.width = 100 * slides.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s all';
    slidesWrapper.style.overflow = 'hidden';

    width = window.getComputedStyle(offerSlider).width


    slides.forEach(slide => {
        slide.style.width = width;
    });

    slidesWrapper.style.width = width


    function prevNumber(cur, total) {
        if (+cur === 1) {
            cur = total
        } else {
            cur -= 1
        }
        if (cur < 10) {
            cur = `0${cur}`;    
        }
        return cur
    }

    function nextNumber (cur, total) {
        if (+cur === total) {
            cur = 1
        } else {
            cur += 1
        }
        if (cur < 10) {
            cur = `0${cur}`;    
        }
        return cur
    }


    nextButton.addEventListener('click', () => {
        let dots = document.querySelectorAll('.dot');
        if (currentOffset >= parseInt(width) * (slides.length - 1)) {
            currentOffset = 0;  
        } else {
            currentOffset += parseInt(width);
        }
        slidesField.style.transform = `translateX(-${currentOffset}px)`;
        dots[parseInt(currentSlideNumber.textContent) - 1].classList.remove('active');
        currentSlideNumber.textContent = nextNumber(+currentSlideNumber.textContent, +totalSlideNumber.textContent);
        dots[parseInt(currentSlideNumber.textContent) - 1].classList.add('active');
    });
    
    prevButton.addEventListener('click', () => {
        let dots = document.querySelectorAll('.dot');
        if (currentOffset == 0) {
            currentOffset = parseInt(width) * (slides.length - 1);
        } else {
            currentOffset -= parseInt(width);
        }
        currentOffset = +currentOffset.toFixed(2);
        slidesField.style.transform = `translateX(-${currentOffset}px)`;
        dots[parseInt(currentSlideNumber.textContent) - 1].classList.remove('active');
        currentSlideNumber.textContent = prevNumber(+currentSlideNumber.textContent, +totalSlideNumber.textContent);
        dots[parseInt(currentSlideNumber.textContent) - 1].classList.add('active');
    });
    // slider navigation
    
    let slideNavigator = document.createElement('ol');
    offerSlider.style.position = 'relative';   
    slideNavigator.classList.add('carousel-indicators');

    slides.forEach((item,i) => {
        let navDot = document.createElement('li');
        i === 0 ? navDot.classList.add('dot','active') : navDot.classList.add('dot');
        
        navDot.setAttribute('data-slide-number', `${i}`);
        slideNavigator.append(navDot);
    });

    slideNavigator.addEventListener('click',(event) => {
        if (event.target.hasAttribute('data-slide-number')) {
            currentOffset = parseInt(width) * event.target.getAttribute('data-slide-number');
            slidesField.style.transform = `translateX(-${currentOffset}px)`;
            currentSlideNumber.textContent = nextNumber(parseInt(event.target.getAttribute('data-slide-number')),slides.length);
            let dots = document.querySelectorAll('.dot');
            dots.forEach(item => item.classList.remove('active'))
            dots[parseInt(event.target.getAttribute('data-slide-number'))].classList.add('active')
        }
    })
    offerSlider.append(slideNavigator);

    //calculator

    let gender = document.querySelector('#gender'),
        height = document.querySelector('#height'),
        weight = document.querySelector('#weight'),
        age = document.querySelector('#age'),
        activity = document.querySelector('.calculating__choose_big'),
        calcResult = document.querySelector('.calculating__result > span');
    try {
        chooser1({target: document.querySelector(`#${localStorage.getItem('sex')}`),
                currentTarget: document.querySelector(`#${localStorage.getItem('sex')}`).parentElement})

        chooser1({target: document.querySelector(`#${localStorage.getItem('activity')}`),
                currentTarget: document.querySelector(`#${localStorage.getItem('activity')}`).parentElement})
    } catch {};
             
    console.log(document.querySelector(`#${localStorage.getItem('activity')}`))
    age.value = localStorage.getItem('age');
    height.value = localStorage.getItem('height');
    weight.value = localStorage.getItem('weight');

    function calculateCalories (event) {        
        try {
            if (event.target.value && event.target.value.match(/\D/g)) {
                event.target.style.border = '1px solid red'
            } else {
                event.target.style.border = ''
            }
        } catch {}
        

        if (+height.value && +weight.value && +age.value) {
            let result;
            if (gender.querySelector('.calculating__choose-item_active').textContent === 'Женщина') {
                result = 447.6 + (9.2 * weight.value) + (3.1 * height.value) - (4.3 * age.value)
            } else {
                result = 88.36 + (13.4 * weight.value) + (4.8 * height.value) - (5.7 * age.value)
            }
            switch (activity.querySelector('.calculating__choose-item_active').id) {
                case 'low':
                    result *= 1.2
                    break
                case 'small':
                    result *= 1.375
                    break
                case 'medium':
                    result *= 1.55
                    break
                case 'high':
                    result *= 1.725 
                    break
            }
            calcResult.textContent = '' + result.toFixed(0)
        } else {
            calcResult.textContent = '____'
        }
        localStorage.setItem('sex', gender.querySelector('.calculating__choose-item_active').id);
        localStorage.setItem('height', height.value);
        localStorage.setItem('weight', weight.value);
        localStorage.setItem('age', age.value);
        localStorage.setItem('activity', activity.querySelector('.calculating__choose-item_active').id);
    }
        



    function chooser (event) {
        if (event.target.classList.contains('calculating__choose-item')) {
            for (let item of event.currentTarget.children) {
                item.classList.remove('calculating__choose-item_active');
                if (event.target === item) {
                    item.classList.add('calculating__choose-item_active');
                }
            }
            calculateCalories();
        } 
    };

    function chooser1 (event) {
        if (event.target.classList.contains('calculating__choose-item')) {
            for (let item of event.currentTarget.children) {
                item.classList.remove('calculating__choose-item_active');
                if (event.target === item) {
                    item.classList.add('calculating__choose-item_active');
                }
            }
        } 
    };

    gender.addEventListener('click', chooser);
    activity.addEventListener('click', chooser);
    weight.addEventListener('input', calculateCalories)
    height.addEventListener('input', calculateCalories)
    age.addEventListener('input', calculateCalories)
    calculateCalories()
    

    
})  


