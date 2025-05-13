import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchSuggestedQuestions } from '../../../../redux/chatApi';

const SuggestedQuestions = ({ postContent, selectChat, onSelectQuestion  }) => {
    const [questions, setQuestions] = useState([]);
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const accessToken = currentUser?.accessToken;

    useEffect(() => {
        const loadQuestions = async () => {
            const response = await fetchSuggestedQuestions(postContent, accessToken);
            if (response && response.data && typeof response.data.questions === 'string') {
                const rawText = response.data.questions;

                const questionList = rawText
                    .split('\n')
                    .filter(line => line.trim().startsWith('*'))
                    .map(line =>
                        line
                            .replace(/^[*•–]+\s*/, '') // loại bỏ dấu đầu dòng
                            .replace(/^\*\*/, '')       // loại bỏ ** nếu có ở đầu
                            .replace(/\*\*$/, '')       // loại bỏ ** nếu có ở cuối
                            .trim()
                    );

                setQuestions(questionList);
            }
        };

        if (postContent && accessToken) {
            loadQuestions();
        }
    }, [postContent, selectChat]);

    return (
        <div className='chat-box-left-idea-body' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {questions.map((question, index) => (
                <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => onSelectQuestion?.(question)}
                    style={{
                        color: '#444444',
                        textTransform: 'none',
                        borderColor: '#444444',
                        borderRadius: '15px',
                        alignItems: 'center',
                        margin: '0 5px',
                        marginTop: '5px'
                    }}
                >
                    {question}
                </Button>
            ))}
        </div>
    );
};

export default SuggestedQuestions;
