
/*  cookie   */

const getCookie = (name) => {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const setCookie = (name, value, options = {}) => {

  options = {
    path: '/',
    // при необходимости добавьте другие значения по умолчанию
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}


/*  handlers  */


const onAuthInputChange = (e) => {
    const val = e.target.value

    axios.get(`/auth/${val}`)
    .then(async (res) => {
        const token = res.data
        setCookie('picola-token', token);

        hideAuthForm()
        showLogoutBtn()
        await fetchAllInfo()
        showPreviewByPageNumber(0)
    })
    .catch(function (e) {
        renderError(e.message)
    });
}

const onLogoutBtnClick = () => {
    setCookie('picola-token', '')
    document.location.reload()
}


const onPagiBtnClick = (pageNumber) => {
    showPreviewByPageNumber(pageNumber)
}


/*  renders  */

const showLogoutBtn = () => {
    const logoutBtn = `
        <div class="logout-btn">Logout</div>
    `
    $('body').append(logoutBtn)
    $('.logout-btn').on('click', onLogoutBtnClick)
}

const showAuthForm = () => {
    const authForm = `
        <div class="auth-block">
            <input type="password" id="auth-input" />
        </div>`;
    $('#auth-place').html(authForm)
    $('#auth-input').on('keyup', onAuthInputChange)
}

const hideAuthForm = () => {
    $('#auth-place').html('')
}

let infoByPages = {}

const fetchAllInfo = async () => {
    const token = getCookie('picola-token')
    return await axios.get('/info/all', {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    .then(function (res) {
        const { data } = res
        const countAllInfos = Object.values(data).length

        Object.entries(data).reverse().forEach((el, i) => {

            const id = el[0]
            const pageData = el[1]

            const pageNumber = Math.trunc(i / countImgByOnePage)

            if(!(pageNumber in infoByPages)){
                infoByPages[pageNumber] = []
            }

            infoByPages[pageNumber].push({
                id,
                ...pageData
            })
        });

        return data
    })
    .catch(function (e) {
        console.log(e);
        renderError(e.message)
    });
}

const getPagination = (pageNumber) => {
    const countPages = Object.values(infoByPages).length;

    let pages = ''

    for(let i = 0; i < countPages; i++){
        pages += `
        <div class="one-page" onclick="onPagiBtnClick('${i}')">
            ${i + 1}
        </div>`
    }

    return `
    <a class="pagination" >
        ${pages}
    </a>
    `
}

const showPreviewByPageNumber = (pageNumber) => {

    const pageData = infoByPages[pageNumber]

    let imgs = '';
    
    pageData.forEach(img => {
        const { id, date } = img
        
        const src = `/i/${id}?q=70&w=250&nosave`
        const srcOriginal = `/i/${id}`

        imgs += `
        <div class="one-img">
            <a href="${srcOriginal}" target="_blank">
                <img src="${src}" alt="${src}"/>
            </a>
        </div>`;
    })

    const pagination = getPagination(pageNumber)

    $('.preview-block').html(`
        ${pagination}
            <div class="list-img">${imgs}</div>
        ${pagination}
    `)
}


/*  main func  */

const countImgByOnePage = 40

const checkCookie = async () => {
    const token = getCookie('picola-token');

    if(!token) {
        showAuthForm()
    } else {
        showLogoutBtn()
        await fetchAllInfo()
        showPreviewByPageNumber(0)
    }
}

checkCookie()