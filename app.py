
import streamlit as st
from datetime import date

st.set_page_config(
    page_title="AI Study Buddy",
    page_icon="📚",
    layout="wide"
)

st.title("📚 AI Study Buddy")
st.subheader("Your Personal Study Assistant")
st.write("Organize your studies, create notes, and prepare for exams!")

st.sidebar.title("Navigation")
page = st.sidebar.radio(
    "Choose a feature:",
    ["Home", "Study Planner", "Notes Maker", "Quiz Practice", "About"]
)

if page == "Home":
    st.header("Welcome, Student! 🎓")
    st.write("Make your learning easier with AI Study Buddy.")

    col1, col2 = st.columns(2)

    with col1:
        st.info("📅 Study Planner")
        st.write("Plan your daily study tasks.")

    with col2:
        st.info("📝 Notes Maker")
        st.write("Create organized notes from a topic.")

    st.success("Select a feature from the sidebar to get started!")

elif page == "Study Planner":
    st.header("📅 Study Planner")

    subject = st.text_input("Enter subject")
    task = st.text_input("Enter study task")
    study_date = st.date_input("Study date", value=date.today())

    if st.button("Add Study Task"):
        if subject.strip() and task.strip():
            st.session_state.setdefault("tasks", [])
            st.session_state.tasks.append({
                "subject": subject,
                "task": task,
                "date": str(study_date)
            })
            st.success("Study task added successfully!")
        else:
            st.warning("Please enter both subject and task.")

    st.subheader("Your Study Tasks")

    for i, item in enumerate(st.session_state.get("tasks", []), 1):
        st.write(
            f"{i}. {item['subject']} — {item['task']} "
            f"({item['date']})"
        )

elif page == "Notes Maker":
    st.header("📝 Notes Maker")

    topic = st.text_input("Enter your topic")
    content = st.text_area("Write your notes here")

    if st.button("Generate Notes"):
        if topic.strip() and content.strip():
            st.subheader(topic)
            st.write(content)
            st.download_button(
                "Download Notes",
                data=f"{topic}\n\n{content}",
                file_name="study_notes.txt",
                mime="text/plain"
            )
        else:
            st.warning("Please enter a topic and some content.")

elif page == "Quiz Practice":
    st.header("🧠 Quiz Practice")

    question = st.text_input("Enter your question")
    option_a = st.text_input("Option A")
    option_b = st.text_input("Option B")
    option_c = st.text_input("Option C")
    option_d = st.text_input("Option D")

    correct = st.selectbox(
        "Choose the correct answer",
        ["A", "B", "C", "D"]
    )

    answer = st.radio(
        "Select your answer:",
        ["A", "B", "C", "D"],
        horizontal=True
    )

    if st.button("Check Answer"):
        if question.strip() and all(
            option.strip()
            for option in [option_a, option_b, option_c, option_d]
        ):
            if answer == correct:
                st.success("Correct answer! 🎉")
            else:
                st.error(f"Not quite! The correct answer is {correct}.")
        else:
            st.warning("Please fill in the question and all four options.")

elif page == "About":
    st.header("About AI Study Buddy")
    st.write(
        "AI Study Buddy is a student project designed to help "
        "learners organize study tasks, prepare notes, and practice quizzes."
    )
    st.write("Built with Python and Streamlit.")
    st.caption("Hackday Project 2026")
