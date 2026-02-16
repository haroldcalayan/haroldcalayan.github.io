const ContentLoader = {
    async initAll() {
        await Promise.all([
            this.loadMasthead(),
            this.loadTrustedBy(),
            this.loadAbout(),
            this.loadPortfolio(),
            this.loadSkills(),
            this.loadExperience(),
            this.loadContact()
        ]);
    },

    async fetchJSON(filename) {
        try {
            // Add cache busting
            const timestamp = new Date().getTime();
            const response = await fetch(`content/${filename}?v=${timestamp}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    setHTML(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },

    setAttr(id, attr, value) {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, value);
    },

    async loadMasthead() {
        const data = await this.fetchJSON('masthead.json');
        if (!data) return;

        this.setText('masthead-badge', data.badge);

        // Title with highlight
        const titleEl = document.getElementById('masthead-title');
        if (titleEl) {
            titleEl.innerHTML = `${data.title.main}<span class="text-gradient">${data.title.highlight}</span>`;
        }

        this.setText('masthead-description', data.description);

        // Buttons
        const buttonsContainer = document.getElementById('masthead-buttons');
        if (buttonsContainer && data.buttons) {
            buttonsContainer.innerHTML = data.buttons.map(btn => {
                const isPrimary = btn.style === 'primary';
                const btnClass = isPrimary
                    ? 'btn btn-professional btn-professional-primary btn-lg'
                    : 'btn btn-professional btn-professional-outline btn-lg text-white border-white';
                const icon = btn.icon ? `<i class="${btn.icon} ms-2"></i>` : '';
                return `<a class="${btnClass}" href="${btn.link}">${btn.text}${icon}</a>`;
            }).join('');
        }


        // Profile Image
        const profileImg = document.getElementById('masthead-profile-img');
        if (profileImg) {
            profileImg.src = data.profileImage;
            profileImg.alt = data.profileAlt;
        }

        // Stats
        // Top Left Stat
        const stat1 = data.stats.find(s => s.position === 'top-left');
        if (stat1) {
            this.setText('stat-tl-value', stat1.value + stat1.suffix);
            this.setText('stat-tl-label', stat1.label);
            const el = document.getElementById('stat-tl-value');
            if (el) {
                el.setAttribute('data-count', stat1.value);
                el.setAttribute('data-suffix', stat1.suffix);
            }
        }

        // Bottom Right Stat
        const stat2 = data.stats.find(s => s.position === 'bottom-right');
        if (stat2) {
            this.setText('stat-br-value', stat2.value + stat2.suffix);
            this.setText('stat-br-label', stat2.label);
            const el = document.getElementById('stat-br-value');
            if (el) {
                el.setAttribute('data-count', stat2.value);
                el.setAttribute('data-suffix', stat2.suffix);
            }
        }
    },

    async loadTrustedBy() {
        const data = await this.fetchJSON('trusted-by.json');
        const section = document.getElementById('trusted');
        const container = document.getElementById('trusted-logos-container');

        if (!data || !data.companies || data.companies.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('trusted-section-label', data.label);

        if (container) {
            container.innerHTML = data.companies.map(company => {
                const slug = company.name.toLowerCase().replace(/\s+/g, '-');
                return `
                    <div class="trusted-logo-item logo-${slug}" title="${company.name}">
                        <img src="${company.logo}" alt="${company.name}" class="trusted-logo-img" />
                    </div>
                `;
            }).join('');
        }
    },

    async loadAbout() {
        const data = await this.fetchJSON('about.json');
        if (!data) return;

        this.setText('about-heading', data.heading);
        this.setText('about-description', data.description);

        const highlightsContainer = document.getElementById('about-highlights');
        if (highlightsContainer && data.highlights) {
            highlightsContainer.innerHTML = data.highlights.map(item => `
                <li class="mb-3 d-flex align-items-center">
                    <i class="fas fa-check-circle text-primary-600 me-3"></i>
                    <span class="text-slate-300 fw-medium">${item}</span>
                </li>
            `).join('');
        }

        // Check if there are stats in about.json that need to be mapped.
        // The current HTML has static stats which seem to duplicate masthead stats but in a different layout.
        // Mapping them based on index if available
        if (data.stats && data.stats.length >= 2) {
            const stat1 = data.stats[0];
            this.setText('about-stat-1-value', stat1.value + stat1.suffix);
            this.setText('about-stat-1-label', stat1.label);
            const el1 = document.getElementById('about-stat-1-value');
            if (el1) {
                el1.setAttribute('data-count', stat1.value);
                el1.setAttribute('data-suffix', stat1.suffix);
            }

            const stat2 = data.stats[1];
            this.setText('about-stat-2-value', stat2.value + stat2.suffix);
            this.setText('about-stat-2-label', stat2.label);
            const el2 = document.getElementById('about-stat-2-value');
            if (el2) {
                el2.setAttribute('data-count', stat2.value);
                el2.setAttribute('data-suffix', stat2.suffix);
            }
        }

        if (data.testimonials && data.testimonials.length > 0) {
            const container = document.getElementById('about-testimonial-container');
            if (container) {
                if (data.testimonials.length === 1) {
                    // Single testimonial
                    const t = data.testimonials[0];
                    container.innerHTML = `
                        <div class="p-4 bg-slate-800 rounded-4 border border-primary-900/30">
                            <p class="text-slate-300 mb-0 italic">"${t.quote}"</p>
                            <div class="mt-3 small fw-bold text-primary-600">— ${t.author}</div>
                        </div>
                    `;
                } else {
                    // Multiple testimonials - Create Carousel
                    const carouselId = 'aboutTestimonialCarousel';
                    const items = data.testimonials.map((t, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <div class="p-4 bg-slate-800 rounded-4 border border-primary-900/30">
                                <p class="text-slate-300 mb-0 italic">"${t.quote}"</p>
                                <div class="mt-3 small fw-bold text-primary-600">— ${t.author}</div>
                            </div>
                        </div>
                    `).join('');

                    const indicators = data.testimonials.map((_, index) => `
                        <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
                            class="${index === 0 ? 'active' : ''}" aria-current="${index === 0}" aria-label="Slide ${index + 1}"></button>
                    `).join('');

                    container.innerHTML = `
                        <div id="${carouselId}" class="carousel slide carousel-fade testimonial-carousel" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${indicators}
                            </div>
                            <div class="carousel-inner">
                                ${items}
                            </div>
                        </div>
                    `;

                    // Initialize the carousel if Bootstrap is available
                    if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                        new bootstrap.Carousel(document.getElementById(carouselId), {
                            interval: 5000,
                            ride: 'carousel'
                        });
                    }
                }
            }
        } else if (data.testimonial) {
            // Fallback for legacy format
            this.setText('about-testimonial-quote', `"${data.testimonial.quote}"`);
            this.setText('about-testimonial-author', `— ${data.testimonial.author}`);
        }
    },

    async loadPortfolio() {
        const data = await this.fetchJSON('portfolio.json');
        if (!data) return;

        this.setText('portfolio-heading', data.heading);
        this.setText('portfolio-subheading', data.subheading);

        const track = document.getElementById('portfolio-track');
        if (track && data.projects) {
            track.innerHTML = data.projects.map(project => `
                <div class="portfolio-card-item"
                    data-description="${project.description}"
                    data-tech-stack="${project.techStack}"
                    data-bg-color="${project.bgColor}">
                    <div class="card-image-wrapper">
                        <img class="card-image" src="${project.cardImage}" alt="${project.title}" /> 
                        <img class="card-image-hover" src="${project.hoverImage}" alt="${project.title} Hover" />
                        <div class="card-overlay">
                            <div class="card-category">${project.category}</div>
                            <h3 class="card-title">${project.title}</h3>
                        </div>
                    </div>
                </div>
            `).join('');

            // Re-initialize portfolio interactions if needed
            // Since elements are newly added, checking if we need to call any init function
            if (window.initializePortfolioExpansion) {
                window.initializePortfolioExpansion();
            }
        }
    },

    async loadSkills() {
        const data = await this.fetchJSON('skills.json');
        const section = document.getElementById('expertise');
        if (!data) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('skills-heading', data.heading);
        this.setText('skills-subheading', data.subheading);

        const pillarsContainer = document.getElementById('skills-pillars');
        if (pillarsContainer && data.pillars) {
            pillarsContainer.innerHTML = data.pillars.map(pillar => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 p-4 hover-lift glass-card">
                        <div class="d-flex align-items-center mb-3">
                            <i class="${pillar.icon} fa-lg text-${pillar.iconColor} me-3"></i>
                            <h3 class="h4 fw-bold mb-0 text-white">${pillar.title}</h3>
                        </div>
                        <p class="text-slate-400 mb-0">
                            ${pillar.description}
                        </p>
                    </div>
                </div>
            `).join('');
        }

        this.setText('skills-tech-label', data.techStack?.label);
        const techContainer = document.getElementById('skills-tech-list');
        if (techContainer && data.techStack?.technologies) {
            techContainer.innerHTML = data.techStack.technologies.map(tech =>
                `<span class="badge bg-slate-800 text-slate-300 px-3 py-2 rounded-2 border border-slate-700">${tech}</span>`
            ).join('');
        }
    },

    async loadExperience() {
        const data = await this.fetchJSON('experience.json');
        const section = document.getElementById('process');
        if (!data) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('experience-heading', data.heading);
        this.setText('experience-description', data.subheading);

        const container = document.getElementById('experience-steps-container');
        if (container && data.steps) {
            const count = data.steps.length;
            let colClass = 'col-md-6 col-lg-3';

            if (count === 1) colClass = 'col-md-8';
            else if (count === 2) colClass = 'col-sm-6';
            else if (count === 3) colClass = 'col-md-4';
            else if (count === 5) colClass = 'col-md-4'; // 3 on top, 2 centered below
            else if (count >= 6) colClass = 'col-md-4 col-lg-3';

            container.classList.add('justify-content-center');
            container.innerHTML = data.steps.map(step => `
                <div class="${colClass}">
                    <div class="process-step p-4 h-100 border border-slate-700 rounded-3 bg-slate-800">
                        <div class="h2 fw-bold text-${step.color} mb-3">${step.number}</div>
                        <h3 class="h5 fw-bold mb-3">${step.title}</h3>
                        <p class="small text-slate-400 mb-0">
                            ${step.description}
                        </p>
                    </div>
                </div>
            `).join('');
        }
    },

    async loadContact() {
        const data = await this.fetchJSON('contact.json');
        if (!data) return;

        // Contact Section Heading & Description
        if (data.heading) {
            const headingEl = document.getElementById('contact-heading');
            if (headingEl) {
                headingEl.innerHTML = `${data.heading.main}<span class="text-gradient">${data.heading.highlight}</span>`;
            }
        }
        this.setText('contact-description', data.description);

        // Calendar Link
        this.setAttr('contact-calendar-link', 'href', data.calendarLink);

        // Social Links (Contact & Footer)
        if (data.socialLinks) {
            const contactSocials = document.getElementById('contact-socials');
            const footerSocials = document.getElementById('footer-socials');

            const linksHTML = data.socialLinks.map(link => `
                <a href="${link.url}" target="_blank" class="text-slate-500 hover-text-primary-400 fs-4">
                    <i class="${link.icon}"></i>
                </a>
            `).join('');

            const footerLinksHTML = data.socialLinks.map(link => `
                <a class="btn btn-outline-light btn-social mx-1" href="${link.url}" target="_blank">
                    <i class="${link.icon}"></i>
                </a>
            `).join('');

            if (contactSocials) contactSocials.innerHTML = linksHTML;
            if (footerSocials) footerSocials.innerHTML = footerLinksHTML;
        }

        // Branding & Copyright (Footer)
        this.setText('footer-branding-name', data.footerBranding?.name);
        this.setText('footer-branding-desc', data.footerBranding?.description);
        this.setText('footer-copyright', data.footerBranding?.copyright);
    }
};

window.contentLoader = ContentLoader;
