<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<!DOCTYPE html>
<% 
	HttpSession usersession = request.getSession(false);
	usersession.invalidate();
// 	usersession.removeValue("USER_NAME");
// 	usersession.removeValue("USER_NUMBER");
// 	usersession.removeValue("USER_KIND");
	response.sendRedirect("/index.do");
%>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>

</body>
</html>