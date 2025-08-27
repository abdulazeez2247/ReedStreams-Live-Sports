// Mobile Menu Toggle
        const mobileMenu = document.getElementById('mobileMenu');
        const openMenuBtn = document.getElementById('openMenuBtn');
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        const overlay = document.getElementById('overlay');

        openMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        overlay.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Enhanced Search Functionality
        document.addEventListener('DOMContentLoaded', () => {
            setupSearch();
            setupTuneInButtons();
            updateClock();
            setInterval(updateClock, 1000);
        });

        function setupSearch() {
            const searchInputs = document.querySelectorAll('.search-container input, .mobile-search input');
            const categoryCards = document.querySelectorAll('.category-card');
            const channelCards = document.querySelectorAll('.channel-card');

            // Create search results title if it doesn't exist
            let resultsTitle = document.getElementById('search-results-title');
            if (!resultsTitle) {
                resultsTitle = document.createElement('h2');
                resultsTitle.id = 'search-results-title';
                resultsTitle.style.display = 'none';
                document.querySelector('.sports-categories').parentNode.insertBefore(resultsTitle, document.querySelector('.sports-categories'));
            }

            // Add clear buttons to search inputs
            searchInputs.forEach(input => {
                const container = input.closest('.search-container, .mobile-search');
                const clearBtn = document.createElement('button');
                clearBtn.innerHTML = '<i class="fas fa-times"></i>';
                clearBtn.className = 'clear-search';
                clearBtn.style.display = 'none';
                container.appendChild(clearBtn);

                input.addEventListener('input', (e) => {
                    clearBtn.style.display = e.target.value ? 'block' : 'none';
                    filterContent(e.target.value, categoryCards, channelCards, resultsTitle);
                });

                clearBtn.addEventListener('click', () => {
                    input.value = '';
                    clearBtn.style.display = 'none';
                    filterContent('', categoryCards, channelCards, resultsTitle);
                    input.focus();
                });
            });
        }

        function filterContent(query, categoryCards, channelCards, resultsTitle) {
            const normalizedQuery = query.toLowerCase().trim();
            let resultCount = 0;

            // Reset all cards and remove highlights
            categoryCards.forEach(card => {
                card.style.display = 'block';
                const nameEl = card.querySelector('.category-name');
                nameEl.innerHTML = nameEl.textContent;
            });

            channelCards.forEach(card => {
                card.style.display = 'block';
                const nameEl = card.querySelector('.channel-name');
                nameEl.innerHTML = nameEl.textContent;
            });

            if (normalizedQuery.length === 0) {
                resultsTitle.style.display = 'none';
                return;
            }

            // Filter and highlight category cards
            categoryCards.forEach(card => {
                const nameEl = card.querySelector('.category-name');
                const name = nameEl.textContent.toLowerCase();

                if (name.includes(normalizedQuery)) {
                    resultCount++;
                    highlightText(nameEl, normalizedQuery);
                } else {
                    card.style.display = 'none';
                }
            });

            // Filter and highlight channel cards
            channelCards.forEach(card => {
                const nameEl = card.querySelector('.channel-name');
                const name = nameEl.textContent.toLowerCase();

                if (name.includes(normalizedQuery)) {
                    resultCount++;
                    highlightText(nameEl, normalizedQuery);
                } else {
                    card.style.display = 'none';
                }
            });

            // Update results title
            if (resultCount > 0) {
                resultsTitle.style.display = 'block';
                resultsTitle.innerHTML = `Found ${resultCount} results for "${query}"`;
                resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                resultsTitle.style.display = 'block';
                resultsTitle.innerHTML = `No results found for "${query}"`;
            }
        }

        function highlightText(element, searchText) {
            const text = element.textContent;
            const regex = new RegExp(searchText, 'gi');
            element.innerHTML = text.replace(regex, match => `<span class="highlight-match">${match}</span>`);
        }

        function setupTuneInButtons() {
            document.querySelectorAll('.btn-tune-in').forEach(button => {
                button.addEventListener('click', () => {
                    const url = button.getAttribute('data-url');
                    if (url) {
                        window.location.href = url;
                    } else {
                        console.warn('No data-url attribute found for Tune In button:', button);
                    }
                });
            });
        }

        function updateClock() {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Karachi',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            const dateTime = now.toLocaleString('en-US', options).replace(',', '');
            const clockElement = document.getElementById('clock');
            if (clockElement) {
                clockElement.textContent = dateTime;
            }
        }