
const firebaseConfig = {
    apiKey: "AIzaSyAXST1zO_7Rzal1nmkS6mcdib2L6LVbHC8",
    authDomain: "chatsystem1-b341f.firebaseapp.com",
    databaseURL: "https://chatsystem1-b341f-default-rtdb.firebaseio.com",
    projectId: "chatsystem1-b341f",
    storageBucket: "chatsystem1-b341f.appspot.com",
    messagingSenderId: "111851594752",
    appId: "1:111851594752:web:ab7955b9b052ba907c64e5",
    measurementId: "G-M14RE2SYWG"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------
    // 1) Firebase 초기화
    // -------------------------------
   
  
    let currentUser = null;
    let isAdmin = false;
    let likedPosts = new Set(); // 좋아요 중복 방지
  
    // -------------------------------
    // 2) UI 업데이트
    // -------------------------------
   // 2) UI 업데이트
   const updateUI = () => {
    const loginButton = document.getElementById("login-button");
    const signupButton = document.getElementById("signup-button");
    const logoutButton = document.getElementById("logout-button");
    const editUserButton = document.getElementById("edit-user-button");
    const shopButton = document.getElementById("shop-button");
    const openGivePointsButton = document.getElementById("open-give-points");
    const gameblebt = document.getElementById("odd-even-gamble-button");
    // 모바일 버튼
    const mobileLoginButton = document.getElementById("mobile-login-button");
    const mobileSignupButton = document.getElementById("mobile-signup-button");
    const mobileLogoutButton = document.getElementById("mobile-logout-button");
    const mobileShopButton = document.getElementById("mobile-shop-button");
    const mobileGivePointsButton = document.getElementById("mobile-give-points");
    const mobileeditUserButton = document.getElementById("mobile-edit-user-button");
    const mobilegameblebt = document.getElementById("mobile-odd-even-button");
    
    if (currentUser) {
      // 로그인 상태
      loginButton?.classList.add("hidden");
      signupButton?.classList.add("hidden");
      logoutButton?.classList.remove("hidden");
      editUserButton?.classList.remove("hidden");
      shopButton?.classList.remove("hidden");
      mobileShopButton?.classList.remove("hidden");
      mobileeditUserButton?.classList.remove("hidden");
      gameblebt?.classList.remove("hidden");
      mobilegameblebt?.classList.remove("hidden")
      // 관리자의 포인트 지급 버튼
      if (isAdmin) {
        openGivePointsButton?.classList.remove("hidden");
        mobileGivePointsButton?.classList.remove("hidden");
      } else {
        openGivePointsButton?.classList.add("hidden");
        mobileGivePointsButton?.classList.add("hidden");
      }
  
      // 모바일 메뉴 상태 업데이트
      mobileLoginButton?.classList.add("hidden");
      mobileSignupButton?.classList.add("hidden");
      mobileLogoutButton?.classList.remove("hidden");
    } else {
      // 비로그인 상태
      loginButton?.classList.remove("hidden");
      signupButton?.classList.remove("hidden");
      logoutButton?.classList.add("hidden");
      editUserButton?.classList.add("hidden");
      shopButton?.classList.add("hidden");
      openGivePointsButton?.classList.add("hidden");
  
      // 모바일 메뉴 상태 업데이트
      mobileLoginButton?.classList.remove("hidden");
      mobileSignupButton?.classList.remove("hidden");
      mobileLogoutButton?.classList.add("hidden");
      mobileShopButton?.classList.add("hidden");
      mobileGivePointsButton?.classList.add("hidden");
      mobileeditUserButton?.classList.add("hidden");
  
      gameblebt?.classList.add("hidden");
      mobilegameblebt?.classList.add("hidden")
    }
  };
  
  
  
  // 모바일 메뉴 이벤트 추가
  document.getElementById("mobile-login-button")?.addEventListener("click", () => {
    toggleModal("login-modal", true);
  });
  
  document.getElementById("mobile-signup-button")?.addEventListener("click", () => {
    toggleModal("signup-modal", true);
  });
  
  document.getElementById("mobile-logout-button")?.addEventListener("click", () => {
    auth.signOut()
      .then(() => {
        alert("로그아웃 성공!");
        updateUI();
      })
      .catch((error) => {
        console.error("로그아웃 실패:", error);
        alert("로그아웃 실패: " + error.message);
      });
  });
  
  document.getElementById("mobile-edit-user-button")?.addEventListener("click", () => {
    toggleModal("edit-user-modal", true);
  });
  
  document.getElementById("mobile-shop-button")?.addEventListener("click", () => {
    toggleModal("shop-modal", true);
  });
  
  // 페이지 로드 시 UI 업데이트
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        isAdmin = userDoc.exists && userDoc.data().role === "admin"; // 관리자 여부 확인
      } catch (error) {
        console.error("관리자 확인 오류:", error);
        isAdmin = false;
      }
    } else {
      isAdmin = false;
    }
    updateUI(); // 상태 업데이트
  });
  
    // -------------------------------
    // 3) 모달 열기/닫기 함수
    // -------------------------------
    const toggleModal = (modalId, show) => {
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.error(`모달 요소가 null입니다: ${modalId}`);
        return;
      }
      modal.classList.toggle("hidden", !show);
  
      // 모달 열기 시 body 스크롤 방지
      document.body.style.overflow = show ? "hidden" : "auto";
    };
  
    // 4) 랭킹 버튼 → index2.html 로 이동
    const rankingButton = document.getElementById("ranking-button");
    rankingButton?.addEventListener("click", () => {
      window.location.href = "index2.html";
    });
  
    // -------------------------------
    // 4) 새 글 작성 (이미지 업로드 포함)
    // -------------------------------
     // "게시물 뺏기" 구매 버튼
     const buyStealPostItemButton = document.getElementById("buy-steal-post-item");
  
     buyStealPostItemButton?.addEventListener("click", async () => {
       if (!currentUser) {
         alert("로그인이 필요합니다.");
         return;
       }
   
       try {
         const userDocRef = db.collection("users").doc(currentUser.uid);
         const userDoc = await userDocRef.get();
   
         if (userDoc.exists) {
           const userData = userDoc.data();
           const userPoints = userData.points || 0;
   
           if (userPoints >= 100) {
             // 포인트 차감
             await userDocRef.update({
               points: firebase.firestore.FieldValue.increment(-100),
             });
             await onPointsSpent(100);
             // "게시물 뺏기" 아이템 추가 (예: userDoc에 stealItem 필드 업데이트)
             await userDocRef.update({
               stealItems: firebase.firestore.FieldValue.increment(1), // 아이템 개수 증가
             });
   
             alert("게시물 뺏기 아이템을 구매했습니다!");
           } else {
             alert("포인트가 부족합니다.");
           }
         } else {
           alert("사용자 정보를 찾을 수 없습니다.");
         }
       } catch (error) {
         console.error("구매 중 오류 발생:", error);
         alert("구매 중 오류가 발생했습니다.");
       }
     });
     let selectedPostType = null; // 선택된 게시물 종류

     // 게시물 종류 선택
     const postTypeButtons = document.querySelectorAll(".post-type-option");
     postTypeButtons.forEach((button) => {
       button.addEventListener("click", () => {
         // 기존 선택 상태 초기화
         postTypeButtons.forEach((btn) => btn.classList.remove("bg-blue-100", "border-blue-500"));
         
         // 현재 버튼 선택
         button.classList.add("bg-blue-100", "border-blue-500");
         selectedPostType = button.getAttribute("data-type"); // 선택한 게시물 종류 저장
       });
     });
   
     // 새 글 저장 버튼 클릭
     document.getElementById("save-post").addEventListener("click", async () => {
       const title = document.getElementById("post-title").value.trim();
       const content = document.getElementById("post-content").value.trim();
       const file = document.getElementById("post-file").files[0];
   
       if (!title || !content || !selectedPostType) {
         alert("모든 필드와 게시물 종류를 선택하세요!");
         return;
       }
   
       try {
         // Firestore에 게시글 저장
         const postDoc = {
           title,
           content,
           type: selectedPostType, // 게시물 종류 추가
           timestamp: firebase.firestore.FieldValue.serverTimestamp(),
         };
   
         // 이미지 업로드 처리
         if (file) {
           const storageRef = firebase.storage().ref(`images/${Date.now()}_${file.name}`);
           const snapshot = await storageRef.put(file);
           const imageUrl = await snapshot.ref.getDownloadURL();
           postDoc.imageUrl = imageUrl;
         }
   
         await firebase.firestore().collection("posts").add(postDoc);
   
         alert("게시물이 성공적으로 저장되었습니다!");
         // 모달 닫기 및 입력 필드 초기화
         document.getElementById("post-modal").classList.add("hidden");
         document.getElementById("post-title").value = "";
         document.getElementById("post-content").value = "";
         document.getElementById("post-file").value = "";
         selectedPostType = null;
         postTypeButtons.forEach((btn) => btn.classList.remove("bg-blue-100", "border-blue-500"));
       } catch (error) {
         console.error("게시물 저장 중 오류 발생:", error);
         alert("게시물 저장 중 오류가 발생했습니다.");
       }
     });
    const shopButton = document.getElementById("shop-button");
    const shopModal = document.getElementById("shop-modal");
    const closeShopModal = document.getElementById("close-shop-modal");
  
    shopButton?.addEventListener("click", () => {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
      // 상점 모달 열기
      toggleModal("shop-modal", true);
    });
  
    closeShopModal?.addEventListener("click", () => {
      toggleModal("shop-modal", false);
    });
  
    // [새로 추가] "게시물 하나 지우기" 아이템 구매 로직
    const buyDeletePostItem = document.getElementById("buy-delete-post-item");
    buyDeletePostItem?.addEventListener("click", async () => {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
      try {
        // 구매 비용(예: 50 포인트)
        const cost = 50;
        // 사용자 정보 가져오기
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (!userDoc.exists) {
          alert("사용자 정보가 존재하지 않습니다.");
          return;
        }
        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
  
        if (currentPoints < cost) {
          alert("포인트가 부족합니다!");
          return;
        }
        // 포인트 차감 + deleteCredits(삭제 쿠폰) +1
        await db.collection("users").doc(currentUser.uid).update({
          points: firebase.firestore.FieldValue.increment(-cost),
          deleteCredits: firebase.firestore.FieldValue.increment(1)
        });
        alert("구매 완료! 이제 게시물 하나를 삭제할 수 있는 권한이 추가되었습니다.");
        await onPointsSpent(cost); // 포인트 지출 이벤트 호출
        window.location.reload();
      } catch (err) {
        console.error("아이템 구매 오류:", err);
        alert("아이템 구매 중 오류가 발생했습니다.");
      }
    });
  
    // -------------------------------
    // 5) 관리자 확인
    // -------------------------------
    const checkIfAdmin = async () => {
      if (currentUser) {
        try {
          const userDoc = await db.collection("users").doc(currentUser.uid).get();
          if (userDoc.exists && userDoc.data().role === "admin") {
            console.log("관리자 확인 성공");
            return true;
          }
        } catch (error) {
          console.error("관리자 확인 중 오류:", error);
        }
      }
      console.log("관리자가 아님");
      return false;
    };
  
    // -------------------------------
    // 6) 별점 기능
    // -------------------------------
  // 별점 버튼 이벤트 핸들러
  const enableRatingSection = async (postId) => {
    const ratingSection = document.getElementById("rating-section");
    const adminCheck = await checkIfAdmin();
  
    if (adminCheck) {
      ratingSection?.classList.remove("hidden");
      document.querySelectorAll(".rate").forEach((button) => {
        button.onclick = async () => {
          const rating = parseInt(button.dataset.rating);
  
          try {
            // 게시물 데이터 가져오기
            const postDoc = await db.collection("posts").doc(postId).get();
            if (!postDoc.exists) {
              alert("게시물을 찾을 수 없습니다.");
              return;
            }
  
            const postData = postDoc.data();
            const authorName = postData.author;
  
            // 게시물의 작성자 UID 가져오기
            const usersSnapshot = await db.collection("users").where("name", "==", authorName).get();
            if (usersSnapshot.empty) {
              alert("작성자를 찾을 수 없습니다.");
              return;
            }
  
            const authorDoc = usersSnapshot.docs[0]; // 작성자 데이터
            const authorUid = authorDoc.id;
  
            // Firestore에서 별점 업데이트
            await db.collection("posts").doc(postId).update({ rating });
  
            // 작성자에게 포인트 지급
            await db.collection("users").doc(authorUid).update({
              points: firebase.firestore.FieldValue.increment(rating),
            });
  
            alert(`${rating}점을 부여했습니다! 작성자에게 ${rating} 포인트가 지급되었습니다.`);
            document.getElementById("view-rating").textContent = `${rating}점`;
          } catch (error) {
            console.error("별점 부여 중 오류 발생:", error);
            alert(`별점 부여 중 오류가 발생했습니다: ${error.message}`);
          }
        };
      });
    } else {
      ratingSection?.classList.add("hidden");
    }
  };
  async function onPointsSpent(pointsSpent) {
    // 현재 유저의 포인트 지출 정보 업데이트
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    const pointsUsed = userDoc.data().pointsUsed || 0;
    const newPointsUsed = pointsUsed + pointsSpent;
    const progress = Math.min((newPointsUsed / 100) * 100, 100); // 목표: 100 포인트 지출
  
    await db.collection("users").doc(currentUser.uid).update({
        pointsUsed: newPointsUsed,
        [`badges.spender`]: {
            progress: `${progress}%`,
            achieved: newPointsUsed >= 100,
        },
    });
  
    if (newPointsUsed >= 100) {
        alert("🎉 포인트 지출 뱃지를 획득했습니다!");
    }
  }
  
    // -------------------------------
    // 7) 댓글 작성
    // -------------------------------
    const addComment = (postId) => {
      const commentInput = document.getElementById("comment-input");
      const content = commentInput.value.trim();
  
      if (!content) {
        alert("댓글을 입력하세요.");
        return;
      }
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
  
      // 사용자 이름 가져오기
      db.collection("users").doc(currentUser.uid).get().then((doc) => {
        const userName = (doc.exists && doc.data().name) || "익명";
  
        // Firestore에 댓글 저장
        db.collection("posts").doc(postId)
          .collection("comments")
          .add({
            content,
            author: userName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(() => {
            commentInput.value = "";
            alert("댓글이 작성되었습니다!");
          })
          .catch((error) => {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성 중 오류가 발생했습니다.");
          });
      });
    };
   
      // 홀짝 도박 버튼 클릭 이벤트
      const oddEvenModal = document.getElementById("odd-even-modal");
      const gambleButton = document.getElementById("odd-even-gamble-button");
      const gambleModal = document.getElementById("odd-even-modal");
      const closeGambleModal = document.getElementById("close-odd-even-modal");
      const betAmountInput = document.getElementById("bet-amount");
      const gambleResult = document.getElementById("gamble-result");
      const betOddButton = document.getElementById("bet-odd");
      const betEvenButton = document.getElementById("bet-even");
      const mobileOddEvenButton = document.getElementById("mobile-odd-even-button");
      gambleButton.addEventListener("click", () => {
        toggleModal("odd-even-modal", true);
        gambleResult.classList.add("hidden");
        betAmountInput.value = ""; // 초기화
      });
    
      closeGambleModal.addEventListener("click", () => {
        toggleModal("odd-even-modal", false);
  
        
  
  
  
      });
    // 모바일 메뉴에서 열기
  mobileOddEvenButton?.addEventListener("click", () => {
    oddEvenModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  });
  
      // 홀/짝 베팅 함수
      const placeBet = async (choice) => {
        if (!currentUser) {
          alert("로그인이 필요합니다.");
          return;
        }
    
        const betAmount = parseInt(betAmountInput.value, 10);
        if (isNaN(betAmount) || betAmount <= 0) {
          alert("유효한 베팅 금액을 입력하세요.");
          return;
        }
    
        try {
          const userDoc = await db.collection("users").doc(currentUser.uid).get();
          const userPoints = userDoc.data().points || 0;
    
          if (userPoints < betAmount) {
            alert("포인트가 부족합니다.");
            return;
          }
    
          // 랜덤 결과 생성 (1~100 사이의 숫자)
          const result = Math.floor(Math.random() * 100) + 1;
          const isEven = result % 2 === 0;
    
          // 결과 확인
          const win = (choice === "odd" && !isEven) || (choice === "even" && isEven);
    
          if (win) {
            // 승리: 포인트 두 배
         
            await db.collection("users").doc(currentUser.uid).update({
              points: firebase.firestore.FieldValue.increment(betAmount * 2),
            });
           
            gambleResult.textContent = `🎉 승리! 숫자: ${result} | ${betAmount * 2} 포인트 획득!`;
            alert(`🎉 승리! 숫자: ${result} | ${betAmount * 2} 포인트 획득!`);
            await updateUserPoints();
            gambleResult.classList.remove("hidden");
            gambleResult.classList.add("text-green-500");
            await updateUserPoints();
          } else {
            // 패배: 포인트 차감
           
            await db.collection("users").doc(currentUser.uid).update({
              points: firebase.firestore.FieldValue.increment(-betAmount),
            });
            await updateUserPoints();
            gambleResult.textContent = `😢 패배! 숫자: ${result} | ${betAmount} 포인트 잃음.`;
            alert(`😢 패배! 숫자: ${result} | ${betAmount} 포인트 잃음.`)
            await updateUserPoints();
            gambleResult.classList.remove("hidden");
            gambleResult.classList.add("text-red-500");
            await updateUserPoints();
          }
        } catch (error) {
          console.error("도박 중 오류 발생:", error);
          alert("도박 중 오류가 발생했습니다.");
        }
      };
    
      // 홀/짝 버튼 이벤트 추가
      betOddButton.addEventListener("click", () => placeBet("odd"));
      betEvenButton.addEventListener("click", () => placeBet("even"));
  
    
    // -------------------------------
    // 8) 댓글 실시간 불러오기
    // -------------------------------
    const loadComments = (postId) => {
      const commentList = document.getElementById("comment-list");
      if (!commentList) return;
  
      db.collection("posts").doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          commentList.innerHTML = "";
          snapshot.forEach((doc) => {
            const comment = doc.data();
            const time = comment.timestamp?.toDate().toLocaleString() || "시간 정보 없음";
  
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("p-2", "border", "rounded");
            commentDiv.innerHTML = `
              <p class="text-sm text-gray-800 font-semibold">${comment.author || "익명"}</p>
              <p class="text-sm mb-1">${comment.content}</p>
              <p class="text-xs text-gray-500">${time}</p>
            `;
            commentList.appendChild(commentDiv);
          });
        });
    };
    async function updateUserPoints() {
      if (!currentUser) return;
    
      try {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const userData = userDoc.data();
        const points = userData.points || 0;
    
        const pointsDisplay = document.getElementById("current-points");
        pointsDisplay.textContent = `보유 포인트: ${points}`;
      } catch (error) {
        console.error("포인트 업데이트 오류:", error);
      }
    }
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        await updateUserPoints(); // 포인트 업데이트
      } else {
        currentUser = null;
        document.getElementById("current-points").textContent = ""; // 로그아웃 시 초기화
      }
    });
    document.getElementById("mobile-send-points-button")?.addEventListener("click", async () => {
      // 포인트 전송 로직 실행 후 포인트 갱신
      await updateUserPoints();
    });
    
    // 다른 포인트 관련 이벤트에도 동일 로직 추가
        
    // -------------------------------
    // 8.1) 게시물 삭제
    // -------------------------------
    async function deletePost(postId) {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
      try {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (!userDoc.exists) {
          alert("사용자 정보가 없습니다.");
          return;
        }
        const userData = userDoc.data();
        const credits = userData.deleteCredits || 0;
    
        if (isAdmin || credits > 0) {
          // 관리자 아닐 시 쿠폰 1 소모
          if (!isAdmin) {
            await db.collection("users").doc(currentUser.uid).update({
              deleteCredits: firebase.firestore.FieldValue.increment(-1)
            });
          }
          // 게시물 삭제
          await db.collection("posts").doc(postId).delete();
      
          loadPosts(); // 게시물 목록 새로고침
        } else {
          alert("삭제 권한(쿠폰)이 없습니다!");
        }
      } catch (err) {
        console.error("게시물 삭제 오류:", err);
        alert("게시물 삭제 중 오류가 발생했습니다.");
      }
    }
    
    
    // -------------------------------
    // 9) 게시물 보기(viewPost)
    // -------------------------------
    const viewPost = (postId) => {
      db.collection("posts").doc(postId).get().then((doc) => {
        if (doc.exists) {
          const post = doc.data();
          const timestamp = post.timestamp?.toDate().toLocaleString() || "시간 정보 없음";
  
          document.getElementById("view-title").textContent = post.title || "제목 없음";
          document.getElementById("view-author").textContent = post.author || "작성자 없음";
          document.getElementById("view-timestamp").textContent = timestamp;
          document.getElementById("view-content").textContent = post.content || "내용 없음";
  
          const imageElement = document.getElementById("view-image");
          if (post.imageUrl) {
            imageElement.innerHTML = `<img src="${post.imageUrl}" alt="게시물 이미지" class="max-h-64 w-full object-cover rounded-lg">`;
          } else {
            imageElement.innerHTML = `<span class="text-gray-500">이미지가 없습니다</span>`;
          }
  
          // 좋아요 버튼
          const likeButton = document.getElementById("like-post");
          if (likeButton) {
            likeButton.onclick = () => {
              // 중복 좋아요 방지
              if (likedPosts.has(postId)) {
                alert("이미 좋아요를 누르셨습니다!");
                return;
              }
  
              // 좋아요 +1
              db.collection("posts").doc(postId).update({
                likes: firebase.firestore.FieldValue.increment(1)
              }).then(() => {
                likedPosts.add(postId);
                alert("좋아요를 눌렀습니다!");
              }).catch((error) => {
                console.error("좋아요 업데이트 실패:", error);
                alert("좋아요 업데이트 중 오류가 발생했습니다.");
              });
            };
          }
  
          // 댓글 실시간 불러오기
          loadComments(postId);
  
          // 댓글 작성 버튼
          const addCommentButton = document.getElementById("add-comment");
          if (addCommentButton) {
            addCommentButton.onclick = () => addComment(postId);
          }
  
          // 관리자 별점 섹션
          document.getElementById("view-rating").textContent = post.rating ? `${post.rating}점` : "없음";
          enableRatingSection(postId);
  
          // 모달 열기
          toggleModal("view-modal", true);
        }
      });
    };
  
    // -------------------------------
    // 10) 게시물 목록 불러오기(loadPosts)
    // -------------------------------
    // 상단에 추가
  // 게시물 종류를 아이콘으로 변환하는 함수
const getPostTypeIcon = (type) => {
    switch (type) {
      case "landscape":
        return `<i class="fas fa-mountain text-green-500 text-lg"></i> 풍경사진`;
      case "art":
        return `<i class="fas fa-palette text-blue-500 text-lg"></i> 그림`;
      case "stocks":
        return `<i class="fas fa-chart-line text-yellow-500 text-lg"></i> 주식`;
      case "daily":
        return `<i class="fas fa-calendar-day text-purple-500 text-lg"></i> 일상`;
      default:
        return `<i class="fas fa-question-circle text-gray-500 text-lg"></i> 기타`;
    }
  };
    const loadPosts = async () => {
        const postList = document.getElementById("post-list");
      
        try {
          // 1등 사용자 가져오기
          const topUserSnapshot = await db.collection("users")
            .orderBy("points", "desc")
            .limit(1)
            .get();
          const topUser = topUserSnapshot.empty ? null : topUserSnapshot.docs[0].data().name;
      
          // Firestore의 posts 컬렉션에서 실시간 업데이트 감지
          db.collection("posts")
            .orderBy("timestamp", "desc")
            .onSnapshot(async (snapshot) => {
              // 기존 데이터를 초기화
              postList.innerHTML = "";
      
              try {
                let userStealItems = 0;
                if (currentUser) {
                  const userDoc = await db.collection("users").doc(currentUser.uid).get();
                  userStealItems = userDoc.exists ? userDoc.data().stealItems || 0 : 0;
                }
      
                snapshot.forEach((doc) => {
                  const post = doc.data();
                  const postId = doc.id;
                  const timestamp = post.timestamp?.toDate().toLocaleString() || "시간 정보 없음";
                  const postTypeIcon = getPostTypeIcon(post.type); // 게시물 종류 아이콘 가져오기
                  // 1등 사용자 확인
                  const isTopUser = topUser === post.author;
      
                  // 행 생성
                  const row = document.createElement("tr");
                  if (isTopUser) {
                    row.classList.add("top-user-row", "animate-pulse");
                    row.style.background = "linear-gradient(to right, #ffafbd, #ffc3a0)";
                  }
      
                  row.innerHTML = `
                   <td class="py-3 px-4 text-sm sm:text-base text-center">${postTypeIcon}</td> <!-- 종류 아이콘 표시 -->
                  <td class="py-2 px-4 text-sm sm:text-base truncate whitespace-nowrap">${post.title || "제목 없음"}</td>
                  <td class="py-2 px-4 text-sm sm:text-base truncate whitespace-nowrap">${post.author || "작성자 없음"}</td>
                  <td class="py-2 px-4 hidden md:table-cell text-sm sm:text-base whitespace-nowrap">${timestamp}</td>
                  <td class="py-2 px-4 text-center text-sm sm:text-base whitespace-nowrap">${post.likes || 0}</td>
                  <td class="py-2 px-4 text-center whitespace-nowrap">
                    <button class="view-post bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 transition-all duration-200" data-id="${postId}">
                      보기
                    </button>
                    ${
                      (isAdmin || userStealItems > 0)
                        ? `<button class="steal-post bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-all duration-200 ml-1" data-id="${postId}">뺏기</button>`
                        : ""
                    }
                    ${
                      isAdmin
                        ? `<button class="delete-post bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all duration-200 ml-1" data-id="${postId}">삭제</button>`
                        : ""
                    }
                  </td>
                `;
                  postList.appendChild(row);
                });
      
                // 버튼 이벤트 추가
                document.querySelectorAll(".view-post").forEach((btn) => {
                  btn.addEventListener("click", (e) => {
                    const postId = e.target.dataset.id;
                    viewPost(postId);
                  });
                });
      
                document.querySelectorAll(".delete-post").forEach((btn) => {
                  btn.addEventListener("click", (e) => {
                    const postId = e.target.dataset.id;
                    deletePost(postId);
                  });
                });
      
                document.querySelectorAll(".steal-post").forEach((btn) => {
                  btn.addEventListener("click", (e) => {
                    const postId = e.target.dataset.id;
                    stealPost(postId);
                  });
                });
              } catch (error) {
                console.error("실시간 게시물 로딩 중 오류 발생:", error);
              }
            });
        } catch (error) {
          console.error("1등 사용자 가져오기 실패:", error);
        }
      };
      
  
  
  
  
  let topUserName = null; // 포인트 1등 사용자의 이름
  
  const getTopUser = async () => {
    try {
      const querySnapshot = await db.collection("users")
        .orderBy("points", "desc")
        .limit(1)
        .get();
  
      if (!querySnapshot.empty) {
        const topUserDoc = querySnapshot.docs[0];
        topUserName = topUserDoc.data().name || null;
        console.log("포인트 1등 사용자:", topUserName);
      }
    } catch (error) {
      console.error("포인트 1등 사용자 가져오기 실패:", error);
    }
  };
  
  
  
  // 포인트 전송 기능
  document.getElementById("confirm-send-points").addEventListener("click", async () => {
    const targetName = document.getElementById("target-user-name").value.trim();
    const pointsToSend = parseInt(document.getElementById("send-points-amount").value, 10);
  
    if (!targetName || isNaN(pointsToSend) || pointsToSend <= 0) {
      alert("유효한 이름과 포인트를 입력하세요.");
      return;
    }
  
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    try {
      // 현재 사용자 정보 가져오기
      const currentUserDoc = await db.collection("users").doc(currentUser.uid).get();
      const currentUserData = currentUserDoc.data();
      const currentPoints = currentUserData.points || 0;
  
      if (currentPoints < pointsToSend) {
        alert("포인트가 부족합니다.");
        return;
      }
  
      // 받는 사용자 UID 가져오기
      const targetUserSnapshot = await db.collection("users").where("name", "==", targetName).get();
      if (targetUserSnapshot.empty) {
        alert("받는 사용자를 찾을 수 없습니다.");
        return;
      }
  
      if (targetUserSnapshot.size > 1) {
        alert("동일한 이름을 가진 사용자가 여러 명 있습니다. 관리자에게 문의하세요.");
        return;
      }
  
      const targetUserDoc = targetUserSnapshot.docs[0];
      const targetUserId = targetUserDoc.id;
  
      // 포인트 전송 트랜잭션
      await db.runTransaction(async (transaction) => {
        const senderRef = db.collection("users").doc(currentUser.uid);
        const receiverRef = db.collection("users").doc(targetUserId);
  
        // 포인트 업데이트
        transaction.update(senderRef, {
          points: firebase.firestore.FieldValue.increment(-pointsToSend),
        });
        transaction.update(receiverRef, {
          points: firebase.firestore.FieldValue.increment(pointsToSend),
        });
  
        // 트랜잭션 기록 (선택사항)
        const transactionRef = db.collection("transactions").doc();
        transaction.set(transactionRef, {
          sender: currentUserData.name,
          receiver: targetName,
          points: pointsToSend,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
  
      alert("포인트 전송 완료!");
      sendPointsModal.classList.add("hidden");
      document.body.style.overflow = "auto";
  
      // UI 업데이트
      updateUI();
    } catch (error) {
      console.error("포인트 전송 중 오류 발생:", error);
      alert("포인트 전송 중 오류가 발생했습니다.");
    }
  });
  
  
  
  // 초기 데이터 로드
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      const userDoc = await db.collection("users").doc(user.uid).get();
      isAdmin = userDoc.exists && userDoc.data().role === "admin";
  
      loadPosts(); // 초기 데이터 로드
    } else {
      console.log("로그인이 필요합니다.");
    }
  });
  
    
    
    const stealPost = async (postId) => {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
      try {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const userName = userDoc.data().name || "익명";
        const userStealItems = userDoc.data().stealItems || 0;
    
        if (userStealItems <= 0) {
          alert("뺏기 아이템이 부족합니다.");
          return;
        }
    
        // 게시물의 작성자 이름 변경
        await db.collection("posts").doc(postId).update({
          author: userName,
        });
    
        // 사용자 뺏기 아이템 차감
        await db.collection("users").doc(currentUser.uid).update({
          stealItems: firebase.firestore.FieldValue.increment(-1),
        });
    
        alert("게시물을 성공적으로 뺏었습니다!");
        loadPosts(); // 게시물 목록 새로고침
      } catch (error) {
        console.error("게시물 뺏기 실패:", error);
        alert("게시물을 뺏는 중 오류가 발생했습니다.");
      }
    };
    
    // -------------------------------
    // [신규 추가] 10.5) 모든 사용자 불러오기 + 포인트 지급
    // -------------------------------
    const loadAllUsers = () => {
      const userListDiv = document.getElementById("user-list");
      if (!userListDiv) return;
  
      // users 컬렉션 전체 조회
      db.collection("users").get().then((snapshot) => {
        userListDiv.innerHTML = "";
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const uid = doc.id;
  
          const rowDiv = document.createElement("div");
          rowDiv.className = "p-2 border rounded flex items-center justify-between";
  
          // 사용자 정보 표시
          const userInfo = `
            <span>이름: ${userData.name || "이름 없음"} / 이메일: ${userData.email || ""} / 포인트: ${userData.points || 0}</span>
          `;
  
          // 관리자 전용 "포인트 지급" 버튼
          const givePointsButton = isAdmin ? `
            <button class="give-points-btn bg-yellow-500 text-white px-2 py-1 rounded ml-2" data-uid="${uid}">
              포인트 지급
            </button>
          ` : "";
  
          rowDiv.innerHTML = userInfo + givePointsButton;
          userListDiv.appendChild(rowDiv);
        });
  
        // 포인트 지급 버튼 이벤트
        document.querySelectorAll(".give-points-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const targetUid = e.target.dataset.uid;
            givePointsToUser(targetUid);
          });
        });
      });
    };
  // 포인트 전송 모달 열기/닫기
  const openSendPointsModal = document.getElementById("open-send-points-modal");
  const closeSendPointsModal = document.getElementById("close-send-points-modal");
  const sendPointsModal = document.getElementById("send-points-modal");
  document.getElementById("mobile-send-points-button")?.addEventListener("click", () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    // 포인트 보내기 모달 열기
    toggleModal("send-points-modal", true);
  });
  
  openSendPointsModal.addEventListener("click", () => {
    sendPointsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });
  
  closeSendPointsModal.addEventListener("click", () => {
    sendPointsModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });
    // [신규 함수] 실제 포인트 지급 로직
  function givePointsToUser(targetUid) {
    // 지급할 포인트 양 입력
    const amountStr = prompt("지급할 포인트 양을 입력하세요", "10");
    
    // 입력값 검증: 숫자로 변환
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("유효한 양수를 입력하세요.");
      return;
    }
  
    // Firestore에서 points 증가
    db.collection("users").doc(targetUid)
      .update({
        points: firebase.firestore.FieldValue.increment(amount) // 양수만 허용됨
      })
      .then(() => {
        alert(`${amount} 포인트가 지급되었습니다!`);
        // 사용자 목록 재로딩
        loadAllUsers();
      })
      .catch((err) => {
        console.error("포인트 지급 오류:", err);
        alert("포인트 지급 중 오류가 발생했습니다.");
      });
  }
  
  
    // 포인트 지급 모달 열기 버튼
    const openGivePointsButton = document.getElementById("open-give-points");
    openGivePointsButton?.addEventListener("click", () => {
      // 관리자만 열 수 있다고 가정 (isAdmin 체크)
      if (!isAdmin) {
        alert("관리자만 접근 가능합니다.");
        return;
      }
      // 모달 열기
      toggleModal("give-points-modal", true);
      // 열 때마다 전체 유저 목록 로드 
      loadAllUsers();
    });
  
    // 포인트 지급 모달 닫기 버튼
    const closeGivePointsModal = document.getElementById("close-give-points-modal");
    closeGivePointsModal?.addEventListener("click", () => {
      toggleModal("give-points-modal", false);
    });
    // -------------------------------
    // 11) 로그인, 회원가입, 로그아웃
    // -------------------------------
    // (예시)
    document.getElementById("login-submit")?.addEventListener("click", () => {
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();
  
      if (!email || !password) {
        alert("이메일과 비밀번호를 입력하세요.");
        return;
      }
  
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          alert("로그인 성공!");
          toggleModal("login-modal", false);
          window.location.reload(); // 새로고침 추가
        })
        .catch((error) => {
          console.error("로그인 실패:", error);
          alert(`로그인 실패: ${error.message}`);
        });
    });
  
    document.getElementById("signup-submit")?.addEventListener("click", () => {
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      const name = document.getElementById("signup-name").value.trim();
  
      if (!email || !password || !name) {
        alert("모든 필드를 입력하세요.");
        return;
      }
  
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          // Firestore에 user 문서 생성
          return db.collection("users").doc(user.uid).set({ name, email });
        })
        .then(() => {
          alert("회원가입 성공!");
          toggleModal("signup-modal", false);
        })
        .catch((error) => {
          console.error("회원가입 실패:", error);
          alert(`회원가입 실패: ${error.message}`);
        });
    });
  
    // 회원 정보 수정 (이름 변경)
    document.getElementById("save-user-info")?.addEventListener("click", () => {
      const newName = document.getElementById("edit-username").value.trim();
      if (!newName) {
        alert("새 이름을 입력하세요.");
        return;
      }
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }
  
      // Firestore users/{uid} 문서 업데이트
      db.collection("users")
        .doc(currentUser.uid)
        .update({ name: newName })
        .then(() => {
          alert("이름이 변경되었습니다!");
          toggleModal("edit-user-modal", false);
          document.getElementById("edit-username").value = "";
        })
        .catch((error) => {
          console.error("이름 업데이트 실패:", error);
          alert("이름 업데이트 중 오류가 발생했습니다.");
        });
    });
  
    document.getElementById("logout-button")?.addEventListener("click", () => {
      auth.signOut()
        .then(() => {
          alert("로그아웃 성공!");
          currentUser = null;
          
          updateUI();
          window.location.reload(); // 새로고침 추가
        })
        .catch((error) => {
          console.error("로그아웃 실패:", error);
          alert(`로그아웃 실패: ${error.message}`);
        });
    });
  
    // -------------------------------
    // 12) 모달 외부 클릭 등 설정
    // -------------------------------
    const setupModalEventListeners = () => {
      // 로그인 모달 열기
      document.getElementById("login-button")?.addEventListener("click", () => {
        toggleModal("login-modal", true);
      });
      document.getElementById("close-login-modal")?.addEventListener("click", () => {
        toggleModal("login-modal", false);
      });
  
      // 회원가입 모달 열기
      document.getElementById("signup-button")?.addEventListener("click", () => {
        toggleModal("signup-modal", true);
      });
      document.getElementById("close-signup-modal")?.addEventListener("click", () => {
        toggleModal("signup-modal", false);
      });
  
      // 새 글 작성 모달
      document.getElementById("new-post")?.addEventListener("click", () => {
        toggleModal("post-modal", true);
      });
      document.getElementById("close-post-modal")?.addEventListener("click", () => {
        toggleModal("post-modal", false);
      });
  
      // 게시물 보기 모달
      document.getElementById("close-view-modal")?.addEventListener("click", () => {
        toggleModal("view-modal", false);
      });
  
      // 회원 정보 수정 모달
      document.getElementById("edit-user-button")?.addEventListener("click", () => {
        toggleModal("edit-user-modal", true);
      });
      document.getElementById("close-edit-user-modal")?.addEventListener("click", () => {
        toggleModal("edit-user-modal", false);
      });
  
      // 모달 배경 클릭 시 닫기
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "auto";
          }
        });
      });
    };
  // 모바일 메뉴의 랭킹 버튼 클릭 이벤트
  document.getElementById("mobile-ranking-button")?.addEventListener("click", () => {
    window.location.href = "index2.html"; // 랭킹 페이지로 이동
  });
  
    // -------------------------------
    // 13) Firebase 인증 상태 체크
    // -------------------------------
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        console.log("로그인된 사용자:", user.email);
        // 관리자 여부 확인
        isAdmin = await checkIfAdmin();
      } else {
        console.log("사용자가 로그인하지 않았습니다.");
        isAdmin = false;
      }
      updateUI();
      // 게시글 목록 로드
      loadPosts();
  
      // 관리자면 전체 유저 목록 로드
      if (isAdmin) {
        loadAllUsers();
      }
    });
  
    // -------------------------------
    // 14) init
    // -------------------------------
    setupModalEventListeners();
  });
  