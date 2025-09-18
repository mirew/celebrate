let _scrollTop = 0,
	saveScrollTop = 0,
	_wrapper,
	_header,
	_content,
	_docker,
  popIdx = 999,
  stickyEl,
  showSticky = true,
  gallerySwiper;


$(window).on('load', function() {
})

$(window).on('resize', function(e){
});

$(window).ready(function(){
    // 전역변수 재선언
	_wrapper = $('.wrapper');
	_header = $('.header-wrap');
	_content = $('.content-wrap');
	_scrollTop = _content.scrollTop();
  stickyEl =  $('.sticky-my-info');
  if(stickyEl.hasClass('none')) showSticky = false;

	// function 실행
  setVH();
  setDialog();
  btnToastActive();
  setFold();
  setCopyText();
  setGalleryMore();
  setAudioControl();
  setGallerySwiper();
  setZoom();
  setGoTop()
  
  _content.on('scroll', function(e){
    // 전역변수 재선언
    _scrollTop = _content.scrollTop();
    
    // AOS 리프레시 (스크롤 시 위치 재계산)
    if(typeof AOS !== 'undefined') {
        AOS.refresh();
    }

  });
});

$(window).on('resize', function(e){
  setVH();
});

// AOS 초기화를 DOM 로드 완료 후 실행
$(window).on('load', function() {
  setVH();

  AOS.init({
      offset: 100,
      delay: 0,
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: false,
      anchorPlacement: 'top-bottom',
      // 스크롤 컨테이너 지정
      container: '.content-wrap'
  });
  
  // AOS 리프레시 (스크롤 위치 재계산)
  setTimeout(function() {
      AOS.refresh();
  }, 100);
  
  // 추가 안전장치: 수동으로 AOS 요소들 체크
  setTimeout(function() {
      checkAOSElements();
  }, 500);

});

// AOS 요소들이 제대로 작동하는지 확인하는 함수
function checkAOSElements() {
    $('[data-aos]').each(function() {
        var $element = $(this);
        var offset = $element.offset();
        var scrollTop = $('.content-wrap').scrollTop();
        var windowHeight = $('.content-wrap').height();
        
        // 요소가 뷰포트에 들어왔는지 확인
        if (offset && offset.top <= scrollTop + windowHeight - 100) {
            $element.addClass('aos-animate');
        }
    });
}

// vh 재설정 
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// layerpopup on,off
function setDialog(){
	// 이벤트 위임 방식으로 변경
	$(document).on('click', 'button[data-pop-tg]', function(){
		let popEl = $('#' + $(this).data('pop-tg'));
		dialogOpen(popEl, $(this));
		// 삭제 팝업이 열릴 때마다 에러 메시지 숨김 및 비밀번호 입력란 초기화
		if(popEl.attr('id') === 'popCommentDel') {
			popEl.find('.err-msg').hide();
			popEl.find('input[type="password"]').val('');
		}
	});

	$('[data-pop-close]').add('.pop-header .btn-close').add('.popup-bg').on('click', function(){
		dialogClose($(this))
	});
}

// 팝업 열림 처리
function dialogOpen(el, tg){
	el.addClass('active');
  $('body').addClass('pop-open');
  ++popIdx;
  el.css('z-index', popIdx);

  $('.popup-wrap').removeClass('lastest');

  $('.popup-wrap.active').each(function(el){
    if(popIdx === parseInt($(this).css('z-index'))){
      $(this).addClass('lastest')
    }
  });

  if(gallerySwiper && tg.closest('li').length > 0){
    gallerySwiper.slideTo(tg.closest('li').index(), 0);
  }
}

// 팝업 닫힘 처리
function dialogClose(tg){
  tg.parents('.popup-wrap').removeClass('active lastest').removeAttr('style');

  --popIdx;

  $('.popup-wrap.active').each(function(el){
    if(popIdx === parseInt(tg.css('z-index'))){
      tg.addClass('lastest')
    }
  });

  if(showSticky === false) stickyEl.addClass('none');
  $('body').removeClass('show-sticky sticky-fixed');

  if($('.popup-wrap.active').length === 0){
    $('body').removeClass('pop-open');
  }

  if(gallerySwiper && tg.closest('li').length > 0){
    gallerySwiper.slideTo(0);
  }
}

/*  toast message
	@@param toastMsg - 토스트 메세지 내용
*/
let toastRemove, toastAnimate;
function setToastOnOff(toastMsg){	
	if($('.toast-message').length !== 0) {
		$('.toast-message').remove();
		clearTimeout(toastRemove);
		clearTimeout(toastAnimate);
	}

	$('.wrapper').append('<div class="toast-message animate">'+ toastMsg +'</div>');
	if($('.toast-message').width() > $('.wrapper').width() - 80) $('.toast-message').addClass('overflow');

	toastAnimate = setTimeout(function (){
		$('.toast-message').removeClass('animate');
	}, 230);
	
	// 3초 후 삭제
	toastRemove = setTimeout(function (){
		$('.toast-message').addClass('remove-animate');
		
		setTimeout(function (){
			$('.toast-message').remove();
		}, 230);
	}, 3000);
}

// data-toast 속성 가지는 버튼 클릭 시 토스트 팝업 실행
function btnToastActive(){
	$('button[data-toast]').on('click', function(){
		let toastMsg = $(this).data('toast');
		setToastOnOff(toastMsg);
	});
}

// folding 열기/닫기
function setFold(){
  $('.btn-fold').off('click').on('click', function(){
    var tgFold = $(this).parents('.fold-box');
		var foldList = tgFold.siblings('.fold-box');
		
		if(!tgFold.hasClass('active')){
			foldList.removeClass('active');
			foldList.find('.fold-cont').stop().slideUp(230);
		}

		foldSlide(tgFold);
	});

	function foldSlide(tgFold){
		if(tgFold.hasClass('active')){
			tgFold.removeClass('active');
			tgFold.find('.fold-cont').stop().slideUp(230);
			$(this).find('.hidden').text('열기');
		}else{
			tgFold.addClass('active');
			tgFold.find('.fold-cont').stop().slideDown(230);
			$(this).find('.hidden').text('닫기');
		}
	}
}

// 복사 버튼 클릭 시 텍스트 복사
function setCopyText(){
	$('.btn-copy').on('click', function(){
		// 가장 가까운 data-copy-box 찾기
		var copyBox = $(this).closest('[data-copy-box]');
		
		if(copyBox.length > 0){
			// data-copy-box 내부의 data-copy-tg 요소 찾기
			var copyTarget = copyBox.find('[data-copy-tg]');
			
			if(copyTarget.length > 0){
				var textToCopy = copyTarget.text().trim();
				
				// 클립보드에 복사
				if(navigator.clipboard && window.isSecureContext){
					// 모던 브라우저용 Clipboard API
					navigator.clipboard.writeText(textToCopy).then(function(){
						setToastOnOff('복사되었습니다.');
					}).catch(function(err){
						console.error('복사 실패:', err);
						fallbackCopyTextToClipboard(textToCopy);
					});
				} else {
					// 구형 브라우저용 fallback
					fallbackCopyTextToClipboard(textToCopy);
				}
			}
		}
	});
	
	// 구형 브라우저용 복사 함수
	function fallbackCopyTextToClipboard(text) {
		var textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		
		try {
			var successful = document.execCommand('copy');
			if(successful){
				setToastOnOff('복사되었습니다.');
			} else {
				setToastOnOff('복사에 실패했습니다.');
			}
		} catch (err) {
			console.error('복사 실패:', err);
			setToastOnOff('복사에 실패했습니다.');
		}
		
		document.body.removeChild(textArea);
	}
}

function setMap(){
  // 카카오맵 API 로딩 확인 후 초기화
  function initKakaoMap() {
    try {
      var mapContainer = document.getElementById('map'); // 지도를 표시할 div 
      var mapOption = { 
        center: new kakao.maps.LatLng(37.4496, 127.1269), // 가천컨벤션센터 좌표
        level: 3 // 지도의 확대 레벨
      };

      // 지도를 생성합니다    
      var map = new kakao.maps.Map(mapContainer, mapOption); 

      // 마커를 생성합니다
      var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(37.4496, 127.1269)
      });

      // 마커를 지도에 표시합니다
      marker.setMap(map);

      // 인포윈도우 추가
      var iwContent = '<div style="padding:10px;min-width:200px;text-align:center;">' +
                      '<h3 style="margin:0 0 5px 0;font-size:16px;">가천컨벤션센터</h3>' +
                      '<p style="margin:0;font-size:14px;">경기도 성남시 수정구 성남대로 1342</p>' +
                      '<p style="margin:5px 0 0 0;font-size:12px;color:#666;">5층</p>' +
                      '</div>',
          iwPosition = new kakao.maps.LatLng(37.4496, 127.1269);

      var infowindow = new kakao.maps.InfoWindow({
        position: iwPosition,
        content: iwContent
      });

      // 지도 로드 완료 후 인포윈도우 표시
      kakao.maps.event.addListener(map, 'tilesloaded', function() {
        infowindow.open(map, marker);
      });
    } catch (error) {
      console.error('카카오맵 초기화 오류:', error);
    }
  }
}

// 갤러리 더보기 기능
function setGalleryMore(){
  $('.btn-more').on('click', function(){
    const galleryTg = $('.gallery-list');
    const btnTg = $(this);
    
    if(galleryTg.hasClass('active')){
      galleryTg.removeClass('active');
      btnTg.text('더보기');
    }else{
      galleryTg.addClass('active');
      btnTg.text('접기');
    }
  });
}

function setAudioControl(){
  const audio = document.querySelector('audio');
  const btn = $('.btn-silent');

  btn.on('click', function(){
    if (!audio.paused) {
      // 이미 재생 중이면 음소거만 토글
      audio.muted = !audio.muted;
    } else {
      // 재생 중이 아니면 음소거 해제 + 재생
      audio.muted = false;
      audio.play();
    }
    // 버튼 상태는 아래 이벤트 리스너에서 자동으로 처리
  });

  function updateMuteButton() {
    if(audio.muted || audio.paused) {
      btn.addClass('mute');
    } else {
      btn.removeClass('mute');
    }
  }

  audio.addEventListener('play', updateMuteButton);
  audio.addEventListener('pause', updateMuteButton);
  audio.addEventListener('volumechange', updateMuteButton);

  updateMuteButton();
}

function setGallerySwiper(){
  gallerySwiper = new Swiper('.gallery-swiper .swiper', {
    init: false,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    watchOverflow: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction'
    },
  });

  gallerySwiper.init();
}

function setZoom(){
  $('.btn-zoom').on('click', function(){
    $('html').toggleClass('zoom');
    $(this).toggleClass('zoomout');
  });
}

function setGoTop(){
  $('.btn-top').on('click', function(){
    $('.content-wrap').scrollTop(0);
  });

  $('.content-wrap').on('scroll', function(){
    if($('.content-wrap').scrollTop() > 300){
      $('.btn-top').addClass('active');
    }else{
      $('.btn-top').removeClass('active');
    }
  });
}

// 1. Firebase 설정 (본인 프로젝트의 config로 교체)
const firebaseConfig = {
  apiKey: "AIzaSyAUEex6zWiKpgK0oYOt_Q9QbkAaxvKyuR8",
  authDomain: "celebrate-e9d31.firebaseapp.com",
  projectId: "celebrate-e9d31",
  storageBucket: "celebrate-e9d31.firebasestorage.app",
  messagingSenderId: "768572407327",
  appId: "1:768572407327:web:8da694d2c5c502ab681f2a",
  measurementId: "G-1C7E2BGSBG"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 방명록 글 등록
async function addGuestbook(name, message, password) {
  await db.collection('guestbook').add({
    name,
    message,
    password,
    created_at: new Date()
  });
}

// 방명록 글 목록 불러오기
function loadGuestbook() {
  db.collection('guestbook').orderBy('created_at', 'desc').onSnapshot(snapshot => {
    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      list.push({ id: doc.id, ...data });
    });
    renderGuestbook(list);
  });
}

// 방명록 글 수정
async function updateGuestbook(id, newMessage, password) {
  const docRef = db.collection('guestbook').doc(id);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    throw new Error('글이 존재하지 않습니다');
  }
  
  if (docSnap.data().password !== password) {
    throw new Error('비밀번호가 달라요');
  }
  
  await docRef.update({
    message: newMessage
  });
}

// 방명록 글 삭제
async function deleteGuestbook(id, password) {
  const docRef = db.collection('guestbook').doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) throw new Error('글이 없습니다');
  if (docSnap.data().password !== password) throw new Error('비밀번호가 달라요');
  await docRef.delete();
}

// 입력값 검증 함수
function validateEditInput(message, password) {
  if (!message.trim()) {
    throw new Error('메시지를 입력해주세요');
  }
  
  if (message.length > 200) {
    throw new Error('메시지는 200자 이하로 입력해주세요');
  }
  
  if (!password.trim()) {
    throw new Error('비밀번호를 입력해주세요');
  }
  
  return true;
}

// XSS 방지 함수
function sanitizeMessage(message) {
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 화면에 목록 그리기 (여러 card-list 지원)
function renderGuestbook(list) {
  document.querySelectorAll('.card-list').forEach($list => {
    $list.innerHTML = '';
    if (list.length === 0) {
      $list.innerHTML = '<li><div class="card-box"><p class="desc">아직 방명록이 없습니다.</p></div></li>';
      return;
    }
    list.forEach(item => {
      $list.innerHTML += `
        <li>
          <div class="card-box">
            <div class="card-actions">
              <button class="btn-edit" data-id="${item.id}" data-pop-tg="popCommentEdit"><span class="blind">수정</span></button>
              <button class="btn-del" data-id="${item.id}" data-pop-tg="popCommentDel"><span class="blind">삭제</span></button>
            </div>
            <p class="desc">${item.message.replace(/\n/g, '<br>')}</p>
            <div class="card-info">
              <div class="name">From <span>${item.name}</span></div>
              <div class="date">${item.created_at.toDate ? item.created_at.toDate().toLocaleString() : ''}</div>
            </div>
          </div>
        </li>
      `;
    });
  });
}

// 팝업 내 "방명록 남기기" 버튼 클릭 이벤트 연결 (DOMContentLoaded 이후)
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.querySelector('#popComment .btn-comment');
  if (btn) {
    btn.onclick = async function() {
      const pop = document.querySelector('#popComment');
      const name = pop.querySelector('input[type="text"]').value.trim();
      const password = pop.querySelector('input[type="password"]').value.trim();
      const message = pop.querySelector('textarea').value.trim();
      if (!name || !message || !password) return; // 안내 메시지는 index.html에서 처리
      await addGuestbook(name, message, password);
      pop.querySelector('input[type="text"]').value = '';
      pop.querySelector('input[type="password"]').value = '';
      pop.querySelector('textarea').value = '';
      // 팝업 닫기
      pop.classList.remove('active');
      document.body.classList.remove('pop-open'); // 흐림 효과도 함께 제거
    };
  }

  // 수정 버튼 클릭 시 데이터 로드 및 팝업 열기
  document.addEventListener('click', async function(e) {
    if (e.target.matches('.btn-edit[data-pop-tg="popCommentEdit"]')) {
      const id = e.target.getAttribute('data-id');
      try {
        const docRef = db.collection('guestbook').doc(id);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          const data = docSnap.data();
          const pop = document.getElementById('popCommentEdit');
          
          // 기존 데이터로 폼 채우기
          pop.querySelector('.edit-name').value = data.name;
          pop.querySelector('.edit-message').value = data.message;
          pop.querySelector('.edit-password').value = '';
          pop.dataset.editId = id;
          
          // 에러 메시지 숨김
          pop.querySelector('.err-msg').style.display = 'none';
          
          // 팝업 열기
          dialogOpen($(pop));
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setToastOnOff('데이터를 불러올 수 없습니다.');
      }
    }
  });

  // 삭제 버튼 클릭 시 id를 팝업에 저장
  document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-del[data-pop-tg="popCommentDel"]')) {
      var id = e.target.getAttribute('data-id');
      var pop = document.getElementById('popCommentDel');
      if (pop) pop.dataset.deleteId = id;
    }
  });

  // 수정 팝업에서 '수정하기' 버튼 클릭 이벤트
  var editBtn = document.querySelector('#popCommentEdit .btn-comment');
  if (editBtn) {
    editBtn.onclick = async function() {
      const pop = document.querySelector('#popCommentEdit');
      const id = pop.dataset.editId;
      const password = pop.querySelector('.edit-password').value.trim();
      const message = pop.querySelector('.edit-message').value.trim();
      
      // 에러 메시지 초기화
      pop.querySelector('.err-msg').style.display = 'none';
      
      try {
        // 입력값 검증
        validateEditInput(message, password);
        
        // 메시지 수정
        await updateGuestbook(id, sanitizeMessage(message), password);
        
        // 성공 시 폼 초기화 및 팝업 닫기
        pop.querySelector('.edit-password').value = '';
        pop.querySelector('.edit-message').value = '';
        pop.querySelector('.edit-name').value = '';
        pop.classList.remove('active');
        document.body.classList.remove('pop-open');
        
        setToastOnOff('방명록이 수정되었습니다.');
        
      } catch (error) {
        // 에러 메시지 표시
        pop.querySelector('.err-msg').textContent = error.message;
        pop.querySelector('.err-msg').style.display = 'block';
      }
    };
    
    // 수정 팝업 입력값 변경 시 에러 메시지 숨김
    var editPwInput = document.querySelector('#popCommentEdit .edit-password');
    var editMsgInput = document.querySelector('#popCommentEdit .edit-message');
    
    if (editPwInput) {
      editPwInput.addEventListener('input', function() {
        document.querySelector('#popCommentEdit .err-msg').style.display = 'none';
      });
    }
    
    if (editMsgInput) {
      editMsgInput.addEventListener('input', function() {
        document.querySelector('#popCommentEdit .err-msg').style.display = 'none';
      });
    }
  }

  // 삭제 팝업에서 '지우기' 버튼 클릭 시만 비밀번호 오류 메시지 표시
  var delBtn = document.querySelector('#popCommentDel .btn-comment');
  if (delBtn) {
    delBtn.onclick = async function() {
      const pop = document.querySelector('#popCommentDel');
      const id = pop.dataset.deleteId;
      const password = pop.querySelector('input[type="password"]').value.trim();
      // 항상 에러 메시지 숨김
      pop.querySelector('.err-msg').style.display = 'none';
      if (!password) return;
      // 삭제 시도
      try {
        await deleteGuestbook(id, password);
        pop.classList.remove('active');
        document.body.classList.remove('pop-open'); // 흐림 효과도 함께 제거
      } catch (e) {
        // 비밀번호 오류 시만 에러 메시지 표시
        pop.querySelector('.err-msg').style.display = 'block';
      }
    };
    // 입력값 변경 시 에러 메시지 숨김
    var pwInput = document.querySelector('#popCommentDel input[type="password"]');
    if (pwInput) {
      pwInput.addEventListener('input', function() {
        document.querySelector('#popCommentDel .err-msg').style.display = 'none';
      });
    }
  }
});

// 최초 목록 불러오기
loadGuestbook();