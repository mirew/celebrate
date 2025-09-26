let _scrollTop = 0,
	saveScrollTop = 0,
	_wrapper,
	_header,
	_content,
	_docker,
  popIdx = 999,
  stickyEl,
  showSticky = true;

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD3Qv_gttiKidOva_ZPGLHvwJbrXZhpDag",
  authDomain: "celebrate-ym.firebaseapp.com",
  projectId: "celebrate-ym",
  storageBucket: "celebrate-ym.firebasestorage.app",
  messagingSenderId: "291552077886",
  appId: "1:291552077886:web:8f450ce4f9bf5fdb56896f",
  measurementId: "G-7G2FYBN930"
};

// Firebase 초기화
let db;
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}


$(window).on('load', function() {
})

$(window).on('resize', function(e){
});

$(document).ready(function(){
    // 전역변수 재선언
	_wrapper = $('.wrapper');
	_header = $('.header-wrap');
	_content = $(window);
	_scrollTop = $(window).scrollTop();
  stickyEl =  $('.sticky-my-info');
  if(stickyEl.hasClass('none')) showSticky = false;

	// function 실행
  setVH();
  btnToastActive();
  setFold();
  setCopyText();
  setGalleryMore();
  setZoom();
  setAudioControl();
  setGoTop();
  setAccountFold();
  setCopyAccount();
  setPopupControl();
  setGallerySwiper();
  setGuestbookEvents();
  
  // 방명록 목록 렌더링 (Firebase 실시간 연동)
  setTimeout(function() {
    loadGuestbookFromFirebase();
  }, 500);
  
  $(window).on('scroll', function(e){
    // 전역변수 재선언
    _scrollTop = $(window).scrollTop();
    
    // 맨 위로 버튼 표시/숨김
    if(_scrollTop > 300){
      $('.btn-top').addClass('active');
    } else {
      $('.btn-top').removeClass('active');
    }

  });
});

$(window).on('resize', function(e){
  setVH();
});

// AOS 초기화를 DOM 로드 완료 후 실행
$(window).on('load', function() {
  setVH();

  // AOS 초기화
  setTimeout(function() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
          offset: 100,
          delay: 0,
          duration: 800,
          easing: 'ease-in-out',
          once: false,
          mirror: false,
          anchorPlacement: 'top-bottom'
      });
      
      // 강제로 AOS 새로고침
      setTimeout(function() {
        AOS.refresh();
      }, 100);
    }
  }, 100);

});

// AOS 요소들이 제대로 작동하는지 확인하는 함수
function checkAOSElements() {
    $('[data-aos]').each(function() {
        var $element = $(this);
        var offset = $element.offset();
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        
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
	$('button[data-toast]').off('click').on('click', function(){
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
	$('.btn-copy').off('click').on('click', function(){
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
  $('.btn-more').off('click').on('click', function(){
    const galleryTg = $('.gallery-list');
    const btnTg = $(this);
    
    if(galleryTg.hasClass('active')){
      galleryTg.removeClass('active');
      btnTg.text('더 많은 사진 보기');
    }else{
      galleryTg.addClass('active');
      btnTg.text('접기');
    }
  });
}

function setAudioControl(){
  const audio = document.querySelector('audio');
  const btn = $('.btn-silent');

  btn.off('click').on('click', function(){
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


function setZoom(){
  $('.btn-zoom').off('click').on('click', function(){
    $('html').toggleClass('zoom');
    $(this).toggleClass('zoomout');
  });
}

function setGoTop(){
  $('.btn-top').off('click').on('click', function(){
    $('html, body').animate({scrollTop: 0}, 500);
  });
}

// 방명록 목록 렌더링
function renderGuestbook() {
  // 로컬 스토리지에서 방명록 데이터 가져오기
  let guestbooks = JSON.parse(localStorage.getItem('guestbooks') || '[]');
  
  // 샘플 데이터가 없으면 추가 (최초 1회)
  if (guestbooks.length === 0) {
    const sampleData = [
      {
        id: "sample1",
        name: "김철수",
        password: "1234",
        message: "결혼을 축하합니다! 행복한 가정 꾸리세요~ 💕",
        created_at: new Date("2024-12-01T10:30:00")
      },
      {
        id: "sample2", 
        name: "이영희",
        password: "1234",
        message: "두 분의 사랑이 영원하길 바랍니다.\n새로운 출발을 진심으로 축하드려요!",
        created_at: new Date("2024-12-02T14:20:00")
      },
      {
        id: "sample3",
        name: "박민수",
        password: "1234",
        message: "오랜 친구로서 정말 기쁩니다.\n앞으로도 서로 사랑하며 행복하게 살아가세요! 🎉",
        created_at: new Date("2024-12-03T16:45:00")
      }
    ];
    localStorage.setItem('guestbooks', JSON.stringify(sampleData));
    guestbooks = sampleData;
  }

  document.querySelectorAll('.card-list').forEach($list => {
    $list.innerHTML = '';
    if (guestbooks.length === 0) {
      $list.innerHTML = '<li><div class="card-box"><p class="desc">아직 방명록이 없습니다.</p></div></li>';
      return;
    }
    guestbooks.forEach(item => {
      const createdAt = typeof item.created_at === 'string' ? new Date(item.created_at) : item.created_at;
      $list.innerHTML += `
        <li>
          <div class="card-box">
            <button type="button" class="btn-edit" data-pop-tg="popCommentEdit" data-id="${item.id}"><span class="blind">수정</span></button>
            <button type="button" class="btn-del" data-pop-tg="popCommentDel" data-id="${item.id}"><span class="blind">삭제</span></button>
            <p class="desc">${item.message.replace(/\n/g, '<br>')}</p>
            <div class="card-info">
              <div class="name">From <span>${item.name}</span></div>
              <div class="date">${createdAt.toLocaleString()}</div>
            </div>
          </div>
        </li>
      `;
    });
    
    // 새로 생성된 버튼들에 이벤트 연결
    setGuestbookCardEvents();
  });
}



// 계좌 접기/펼치기 기능
function setAccountFold() {
  $('.account-fold-header').off('click').on('click', function() {
    const foldBox = $(this).closest('.account-fold-box');
    foldBox.toggleClass('active');
  });
}

// 계좌번호 복사 기능
function setCopyAccount() {
  $('.btn-copy').off('click').on('click', function() {
    const copyBox = $(this).closest('[data-copy-box]');
    const copyTarget = copyBox.find('[data-copy-tg]').text();
    
    // 클립보드에 복사
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyTarget).then(function() {
        showCopyMessage('복사되었습니다');
      });
    } else {
      // 구형 브라우저 지원
      const textArea = document.createElement('textarea');
      textArea.value = copyTarget;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showCopyMessage('복사되었습니다');
    }
  });
}

// 복사 완료 메시지 표시
function showCopyMessage(message) {
  // 기존 메시지가 있으면 제거
  $('.copy-message').remove();
  
  // 새 메시지 생성
  const messageEl = $('<div class="copy-message">' + message + '</div>');
  messageEl.css({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(130, 2, 1, 0.9)',
    color: '#fff',
    padding: '15px 25px',
    borderRadius: '25px',
    fontSize: '16px',
    zIndex: '10000',
    opacity: '0'
  });
  
  $('body').append(messageEl);
  
  // 페이드 인/아웃 효과
  messageEl.animate({opacity: 1}, 300);
  setTimeout(function() {
    messageEl.animate({opacity: 0}, 300, function() {
      messageEl.remove();
    });
  }, 2000);
}

// 팝업 제어 기능
function setPopupControl() {
  // 팝업 열기
  $('[data-pop-tg]').off('click').on('click', function(e) {
    e.preventDefault();
    const targetPopup = $(this).data('pop-tg');
    const $popup = $('#' + targetPopup);
    
    if ($popup.length > 0) {
      $popup.addClass('active');
      $('body').addClass('popup-open');
      
      // 갤러리 팝업인 경우 클릭된 이미지 인덱스로 이동
      if (targetPopup === 'popFull') {
        const clickedIndex = $(this).closest('.photo-item').index();
        if (window.gallerySwiper && clickedIndex >= 0) {
          window.gallerySwiper.slideTo(clickedIndex);
        }
      }
    }
  });
  
  // 팝업 닫기
  $('[data-pop-close]').off('click').on('click', function(e) {
    e.preventDefault();
    const $popup = $(this).closest('.popup-wrap');
    closePopup($popup);
  });
  
  // 배경 클릭으로 팝업 닫기
  $('.popup-bg').off('click').on('click', function() {
    const $popup = $(this).closest('.popup-wrap');
    closePopup($popup);
  });
  
  // ESC 키로 팝업 닫기
  $(document).off('keydown.popup').on('keydown.popup', function(e) {
    if (e.keyCode === 27) { // ESC 키
      const $activePopup = $('.popup-wrap.active');
      if ($activePopup.length > 0) {
        closePopup($activePopup);
      }
    }
  });
  
  function closePopup($popup) {
    $popup.removeClass('active');
    $('body').removeClass('popup-open');
    
    // 폼 초기화
    $popup.find('input, textarea').val('');
    $popup.find('.err-msg').removeClass('show');
  }
}

// 갤러리 Swiper 초기화
function setGallerySwiper() {
  // Swiper가 로드되었는지 확인
  if (typeof Swiper === 'undefined') {
    console.error('Swiper가 로드되지 않았습니다.');
    return;
  }
  
  // 갤러리 Swiper 초기화
  window.gallerySwiper = new Swiper('#popFull .swiper', {
    loop: true,
    centeredSlides: true,
    pagination: {
      el: '#popFull .swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '#popFull .swiper-button-next',
      prevEl: '#popFull .swiper-button-prev',
    },
    keyboard: {
      enabled: true,
    },
    mousewheel: {
      enabled: true,
    },
    autoHeight: false,
    spaceBetween: 10,
    zoom: {
      maxRatio: 3,
      minRatio: 1,
    }
  });
}

// 방명록 이벤트 설정
function setGuestbookEvents() {
  // 방명록 작성
  $('#popComment .btn-comment').off('click').on('click', async function() {
    const name = $('#popComment .form-ip').eq(0).val().trim();
    const password = $('#popComment .form-ip').eq(1).val().trim();
    const message = $('#popComment .form-ta').val().trim();
    
    if (!name) {
      setToastOnOff('성함을 입력해주세요.');
      return;
    }
    
    if (!password) {
      setToastOnOff('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!message) {
      setToastOnOff('메시지를 입력해주세요.');
      return;
    }
    
    try {
      // Firebase에 저장
      if (db) {
        await addGuestbookToFirebase(name, message, password);
        // 방명록 목록 다시 불러오기
        await loadGuestbookFromFirebase();
      } else {
        // Firebase가 없으면 로컬 스토리지 사용
        const newComment = {
          id: Date.now().toString(),
          name: name,
          password: password,
          message: message,
          created_at: new Date()
        };
        saveGuestbook(newComment);
        renderGuestbook();
      }
      
      // 팝업 닫기
      closeGuestbookPopup($('#popComment'));
      setToastOnOff('방명록이 등록되었습니다.');
    } catch (error) {
      setToastOnOff('방명록 등록에 실패했습니다.');
      console.error('방명록 등록 실패:', error);
    }
  });
  
  // 방명록 수정
  $('#popCommentEdit .btn-comment').off('click').on('click', async function() {
    const editId = $('#popCommentEdit').data('edit-id');
    const password = $('#popCommentEdit .edit-password').val().trim();
    const message = $('#popCommentEdit .edit-message').val().trim();
    
    if (!password) {
      setToastOnOff('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!message) {
      setToastOnOff('메시지를 입력해주세요.');
      return;
    }
    
    try {
      // Firebase에서 수정
      if (db) {
        await updateGuestbookInFirebase(editId, message, password);
        closeGuestbookPopup($('#popCommentEdit'));
        setToastOnOff('방명록이 수정되었습니다.');
        // 방명록 목록 다시 불러오기
        await loadGuestbookFromFirebase();
      } else {
        // Firebase가 없으면 로컬 스토리지 사용
        if (updateGuestbook(editId, password, message)) {
          closeGuestbookPopup($('#popCommentEdit'));
          renderGuestbook();
          setToastOnOff('방명록이 수정되었습니다.');
        } else {
          $('#popCommentEdit .err-msg').addClass('show');
        }
      }
    } catch (error) {
      if (error.message.includes('비밀번호')) {
        $('#popCommentEdit .err-msg').addClass('show');
      } else {
        setToastOnOff('방명록 수정에 실패했습니다.');
      }
      console.error('방명록 수정 실패:', error);
    }
  });
  
  // 방명록 삭제
  $('#popCommentDel .btn-comment').off('click').on('click', async function() {
    const deleteId = $('#popCommentDel').data('delete-id');
    const password = $('#popCommentDel .form-ip').val().trim();
    
    if (!password) {
      setToastOnOff('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      // Firebase에서 삭제
      if (db) {
        await deleteGuestbookFromFirebase(deleteId, password);
        closeGuestbookPopup($('#popCommentDel'));
        setToastOnOff('방명록이 삭제되었습니다.');
        // 방명록 목록 다시 불러오기
        await loadGuestbookFromFirebase();
      } else {
        // Firebase가 없으면 로컬 스토리지 사용
        if (deleteGuestbook(deleteId, password)) {
          closeGuestbookPopup($('#popCommentDel'));
          renderGuestbook();
          setToastOnOff('방명록이 삭제되었습니다.');
        } else {
          $('#popCommentDel .err-msg').addClass('show');
        }
      }
    } catch (error) {
      if (error.message.includes('비밀번호')) {
        $('#popCommentDel .err-msg').addClass('show');
      } else {
        setToastOnOff('방명록 삭제에 실패했습니다.');
      }
      console.error('방명록 삭제 실패:', error);
    }
  });
}

// 방명록 저장 (로컬 스토리지 임시 사용)
function saveGuestbook(comment) {
  let guestbooks = JSON.parse(localStorage.getItem('guestbooks') || '[]');
  guestbooks.unshift(comment); // 최신순으로 추가
  localStorage.setItem('guestbooks', JSON.stringify(guestbooks));
}

// 방명록 수정
function updateGuestbook(id, password, message) {
  let guestbooks = JSON.parse(localStorage.getItem('guestbooks') || '[]');
  const index = guestbooks.findIndex(item => item.id === id);
  
  if (index !== -1 && guestbooks[index].password === password) {
    guestbooks[index].message = message;
    guestbooks[index].updated_at = new Date();
    localStorage.setItem('guestbooks', JSON.stringify(guestbooks));
    return true;
  }
  return false;
}

// 방명록 삭제
function deleteGuestbook(id, password) {
  let guestbooks = JSON.parse(localStorage.getItem('guestbooks') || '[]');
  const index = guestbooks.findIndex(item => item.id === id);
  
  if (index !== -1 && guestbooks[index].password === password) {
    guestbooks.splice(index, 1);
    localStorage.setItem('guestbooks', JSON.stringify(guestbooks));
    return true;
  }
  return false;
}

// 방명록 팝업 닫기 함수
function closeGuestbookPopup($popup) {
  $popup.removeClass('active');
  $('body').removeClass('popup-open');
  
  // 폼 초기화
  $popup.find('input, textarea').val('');
  $popup.find('.err-msg').removeClass('show');
}

// 방명록 카드 이벤트 설정
function setGuestbookCardEvents() {
  // 수정 버튼 클릭
  $('.btn-edit[data-pop-tg="popCommentEdit"]').off('click').on('click', async function(e) {
    e.preventDefault();
    const commentId = $(this).data('id');
    
    try {
      let comment = null;
      
      if (db) {
        // Firebase에서 데이터 가져오기
        const docRef = db.collection('guestbook').doc(commentId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          comment = { id: docSnap.id, ...docSnap.data() };
        }
      } else {
        // 로컬 스토리지에서 데이터 가져오기
        const guestbooks = JSON.parse(localStorage.getItem('guestbooks') || '[]');
        comment = guestbooks.find(item => item.id === commentId);
      }
      
      if (comment) {
        // 수정 팝업에 기존 데이터 채우기
        $('#popCommentEdit').data('edit-id', commentId);
        $('#popCommentEdit .edit-name').val(comment.name);
        $('#popCommentEdit .edit-message').val(comment.message);
        $('#popCommentEdit .edit-password').val('');
        $('#popCommentEdit .err-msg').removeClass('show');
        
        // 팝업 열기
        $('#popCommentEdit').addClass('active');
        $('body').addClass('popup-open');
      }
    } catch (error) {
      console.error('방명록 데이터 가져오기 실패:', error);
      setToastOnOff('방명록 정보를 불러오는데 실패했습니다.');
    }
  });
  
  // 삭제 버튼 클릭
  $('.btn-del[data-pop-tg="popCommentDel"]').off('click').on('click', function(e) {
    e.preventDefault();
    const commentId = $(this).data('id');
    
    // 삭제 팝업에 ID 저장
    $('#popCommentDel').data('delete-id', commentId);
    $('#popCommentDel .form-ip').val('');
    $('#popCommentDel .err-msg').removeClass('show');
    
    // 팝업 열기
    $('#popCommentDel').addClass('active');
    $('body').addClass('popup-open');
  });
}

// Firebase 방명록 함수들
// 방명록 추가
async function addGuestbookToFirebase(name, message, password) {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  
  try {
    await db.collection('guestbook').add({
      name,
      message,
      password,
      created_at: new Date()
    });
    return true;
  } catch (error) {
    console.error('방명록 추가 실패:', error);
    throw error;
  }
}

// 방명록 목록 불러오기 (일반 조회)
async function loadGuestbookFromFirebase() {
  if (!db) {
    console.warn('Firebase가 초기화되지 않았습니다. 로컬 스토리지를 사용합니다.');
    renderGuestbook();
    return;
  }
  
  try {
    const snapshot = await db.collection('guestbook').orderBy('created_at', 'desc').get();
    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      list.push({ 
        id: doc.id, 
        name: data.name,
        message: data.message,
        created_at: data.created_at.toDate ? data.created_at.toDate() : new Date(data.created_at)
      });
    });
    renderGuestbookFromFirebase(list);
  } catch (error) {
    console.error('방명록 로드 실패:', error);
    renderGuestbook(); // 실패 시 로컬 스토리지 사용
  }
}

// 방명록 수정
async function updateGuestbookInFirebase(id, newMessage, password) {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  
  try {
    const docRef = db.collection('guestbook').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      throw new Error('글이 존재하지 않습니다');
    }
    
    if (docSnap.data().password !== password) {
      throw new Error('비밀번호가 일치하지 않습니다');
    }
    
    await docRef.update({
      message: newMessage,
      updated_at: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('방명록 수정 실패:', error);
    throw error;
  }
}

// 방명록 삭제
async function deleteGuestbookFromFirebase(id, password) {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  
  try {
    const docRef = db.collection('guestbook').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      throw new Error('글이 존재하지 않습니다');
    }
    
    if (docSnap.data().password !== password) {
      throw new Error('비밀번호가 일치하지 않습니다');
    }
    
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('방명록 삭제 실패:', error);
    throw error;
  }
}

// Firebase용 방명록 렌더링
function renderGuestbookFromFirebase(guestbooks) {
  document.querySelectorAll('.card-list').forEach($list => {
    $list.innerHTML = '';
    if (guestbooks.length === 0) {
      $list.innerHTML = '<li><div class="card-box"><p class="desc">아직 방명록이 없습니다.</p></div></li>';
      return;
    }
    guestbooks.forEach(item => {
      $list.innerHTML += `
        <li>
          <div class="card-box">
            <button type="button" class="btn-edit" data-pop-tg="popCommentEdit" data-id="${item.id}"><span class="blind">수정</span></button>
            <button type="button" class="btn-del" data-pop-tg="popCommentDel" data-id="${item.id}"><span class="blind">삭제</span></button>
            <p class="desc">${item.message.replace(/\n/g, '<br>')}</p>
            <div class="card-info">
              <div class="name">From <span>${item.name}</span></div>
              <div class="date">${item.created_at.toLocaleString()}</div>
            </div>
          </div>
        </li>
      `;
    });
    
    // 새로 생성된 버튼들에 이벤트 연결
    setGuestbookCardEvents();
  });
}


