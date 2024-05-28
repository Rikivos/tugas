function toggle_like(post_id, type) {
    console.log(post_id, type);
    let $a_like = $(`#${post_id} a[aria-label='heart']`);
    let $i_like = $a_like.find("i");
    if ($i_like.hasClass("fa-heart")) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "unlike",
            },
            success: function (response) {
                console.log("unlike");
                $i_like.addClass("fa-heart-o").removeClass("fa-heart");
                $a_like.find("span.like-num").text(response["count"]);
            },
        });
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "like",
            },
            success: function (response) {
                console.log("like");
                $i_like.addClass("fa-heart").removeClass("fa-heart-o");
                $a_like.find("span.like-num").text(response["count"]);
            },
        });
    }
}

$(document).ready(function () {
    get_posts();
});

function toggle_like(post_id, type) {
    let $a_like = $(`#${post_id} a[aria-label='heart']`);
    let $i_like = $a_like.find("i");
    if ($i_like.hasClass("fa-heart")) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "unlike",
            },
            success: function (response) {
                if (response["result"] === "success") {
                    $i_like.addClass("fa-heart-o").removeClass("fa-heart");
                    $a_like.find("span.like-num").text(response["count"]);
                } else {
                    alert("Failed to unlike the post.");
                }
            },
            error: function () {
                alert("Error occurred. Please try again.");
            }
        });
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "like",
            },
            success: function (response) {
                if (response["result"] === "success") {
                    $i_like.addClass("fa-heart").removeClass("fa-heart-o");
                    $a_like.find("span.like-num").text(response["count"]);
                } else {
                    alert("Failed to like the post.");
                }
            },
            error: function () {
                alert("Error occurred. Please try again.");
            }
        });
    }
}
function time2str(date) {
    let today = new Date();
    let time = (today - date) / 1000 / 60;  // minutes

    if (time < 60) {
        return parseInt(time) + " minutes ago";
    }
    time = time / 60;  // hours
    if (time < 24) {
        return parseInt(time) + " hours ago";
    }
    time = time / 24; // days
    if (time < 7) {
        return parseInt(time) + " days ago";
    }
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}
function get_posts() {
    $("#post-box").empty();
    $.ajax({
        type: "GET",
        url: "/get_posts",
        data: {},
        success: function (response) {
            if (response["result"] === "success") {
                let posts = response["posts"];
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i];
                    let time_post = new Date(post["date"]);
                    let html_temp = `<div class="box" id="${post["_id"]}">
                                        <article class="media">
                                            <div class="media-left">
                                                <a class="image is-64x64" href="/user/${post["username"]}">
                                                    <img class="is-rounded" src="/static/${post["profile_pic_real"]}"
                                                         alt="Image">
                                                </a>
                                            </div>
                                            <div class="media-content">
                                                <div class="content">
                                                    <p>
                                                        <strong>${post["profile_name"]}</strong> <small>@${post["username"]}</small> <small>${time2str(time_post)}</small>
                                                        <br>
                                                        ${post["comment"]}
                                                    </p>
                                                </div>
                                                <nav class="level is-mobile">
                                                    <div class="level-left">
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post["_id"]}', 'heart')">
                                                            <span class="icon is-small"><i class="fa ${post["heart_by_me"] ? "fa-heart" : "fa-heart-o"}" aria-hidden="true"></i></span>&nbsp;<span class="like-num">${post["count_heart"]}</span>
                                                        </a>
                                                    </div>
                                                </nav>
                                            </div>
                                        </article>
                                    </div>`;
                    $("#post-box").append(html_temp);
                }
            }
        },
    });
}
// {% if msg %}
//     alert("{{ msg }}")
// {% endif %}
function sign_in() {
    let username = $("#input-username").val();
    let password = $("#input-password").val();

    if (username === "") {
        $("#help-id-login").text("Please input your id.");
        $("#input-username").focus();
        return;
    } else {
        $("#help-id-login").text("");
    }

    if (password === "") {
        $("#help-password-login").text("Please input your password.");
        $("#input-password").focus();
        return;
    } else {
        $("#help-password-login").text("");
    }

    console.log(username, password);
    $.ajax({
        type: "POST",
        url: "/sign_in",
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            if (response["result"] === "success") {
                $.cookie("mytoken", response["token"], { path: "/" });
                window.location.replace("/");
            } else {
                alert(response["msg"]);
            }
        },
    });
}

function toggle_sign_up() {
    $("#sign-up-box").toggleClass("is-hidden");
    $("#div-sign-in-or-up").toggleClass("is-hidden");
    $("#btn-check-dup").toggleClass("is-hidden");
    $("#help-id").toggleClass("is-hidden");
    $("#help-password").toggleClass("is-hidden");
    $("#help-password2").toggleClass("is-hidden");
}
function is_nickname(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,10}$/;
    return regExp.test(asValue);
}

function is_password(asValue) {
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    return regExp.test(asValue);
}

function check_dup() {
    let username = $("#input-username").val();
    console.log(username);
    if (username === "") {
        $("#help-id")
            .text("Enter in your id")
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-username").focus();
        return;
    }
    if (!is_nickname(username)) {
        $("#help-id")
            .text(
                "Please check your id. For your id, please enter 2-10 English characters, numbers, or the following special characters (._-)"
            )
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-username").focus();
        return;
    }
    $("#help-id").addClass("is-loading");
    $.ajax({
        type: "POST",
        url: "/sign_up/check_dup",
        data: {
            username_give: username,
        },
        success: function (response) {
            console.log(response);
            if (response["exists"]) {
                $("#help-id")
                    .text("This id is already in use.")
                    .removeClass("is-safe")
                    .addClass("is-danger");
                $("#input-username").focus();
            } else {
                $("#help-id")
                    .text("This id is available!")
                    .removeClass("is-danger")
                    .addClass("is-success");
            }
            $("#help-id").removeClass("is-loading");
        },
    });
}
function sign_up() {
    let username = $("#input-username").val();
    let password = $("#input-password").val();
    let password2 = $("#input-password2").val();
    console.log(username, password, password2);
    console.log($("#help-id").attr("class"));

    if ($("#help-id").hasClass("is-danger")) {
        alert("Please check your id");
        return;
    } else if (!$("#help-id").hasClass("is-success")) {
        alert("Please double check your id");
        return;
    }

    if (password === "") {
        $("#help-password")
            .text("Please enter your password")
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-password").focus();
        return;
    } else if (!is_password(password)) {
        $("#help-password")
            .text(
                "Please check your password. For your password, please enter 8-20 English characters, numbers, or the following special characters (!@#$%^&*)"
            )
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-password").focus();
        return;
    } else {
        $("#help-password")
            .text("This password can be used!")
            .removeClass("is-danger")
            .addClass("is-success");
    }
    if (password2 === "") {
        $("#help-password2")
            .text("Please enter your password")
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-password2").focus();
        return;
    } else if (password2 !== password) {
        $("#help-password2")
            .text("Your passwords do not match")
            .removeClass("is-safe")
            .addClass("is-danger");
        $("#input-password2").focus();
        return;
    } else {
        $("#help-password2")
            .text("Your passwords match!!!")
            .removeClass("is-danger")
            .addClass("is-success");
    }
    $.ajax({
        type: "POST",
        url: "/sign_up/save",
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            alert("Your are signed up! Nice!");
            window.location.replace("/login");
        },
    });
}
function sign_in() {
    let username = $("#input-username").val();
    let password = $("#input-password").val();

    if (username === "") {
        $("#help-id-login").text("Please input your id.");
        $("#input-username").focus();
        return;
    } else {
        $("#help-id-login").text("");
    }

    if (password === "") {
        $("#help-password").text("Please input your password.");
        $("#input-password").focus();
        return;
    } else {
        $("#help-password-login").text("");
    }
    $.ajax({
        type: "POST",
        url: "/sign_in",
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            if (response["result"] === "success") {
                $.cookie("mytoken", response["token"], { path: "/" });
                window.location.replace("/");
            } else {
                alert(response["msg"]);
            }
        },
    });
}

function clearInputs() {
    $("#input-username").val("");
    $("#input-password").val("");
    $("#input-password2").val("");
}
// Pada fungsi ini, kita menggunakan id user,
// password, dan nickname, untuk mendaftarkan mereka
// ke database kita
function register() {
    $.ajax({
        type: "POST",
        url: "/api/register",
        data: {
            id_give: $("#userid").val(),
            pw_give: $("#userpw").val(),
            nickname_give: $("#usernick").val(),
        },
        success: function (response) {
            if (response["result"] === "success") {
                alert("User registration complete!");
                window.location.href = "/login";
            } else {
                alert(response["msg"]);
            }
        },
    });
}
function create_post(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    let comment = $("#post-comment").val();
    let date = new Date().toISOString(); // Get the current date and time in ISO format

    $.ajax({
        type: "POST",
        url: "/posting",
        data: {
            comment_give: comment,
            date_give: date
        },
        success: function (response) {
            if (response["result"] === "success") {
                alert(response["msg"]);
                $("#post-comment").val(""); // Clear the textarea
                get_posts(); // Refresh the posts
            } else {
                alert("There was an error creating your post. Please try again.");
            }
        },
        error: function (response) {
            alert("There was an error creating your post. Please try again.");
        }
    });
}